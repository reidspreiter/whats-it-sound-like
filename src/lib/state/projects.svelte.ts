import {
  type Edge,
  isEdge,
  isNode,
  type Node,
  type NodeOrigin,
  type XYPosition,
} from "@xyflow/svelte";
import { type DBSchema, type IDBPDatabase, type IDBPTransaction, openDB } from "idb";

import { prop } from "../util";
import { sendNotification } from "./notifications";

export interface ActiveProject {
  id: null | string;
  title: string;
}

export const activeProject = $state<ActiveProject>({ id: null, title: "" });
export let previousActiveProjectId: null | string = null;

const LATEST_VERSION = 1;
const DB_NAME = "projects";

export interface JsonifiedCable extends Edge {}

export interface JsonifiedNode {
  data: Record<string, unknown>;
  id: string;
  measured?: {
    height?: number;
    width?: number;
  };
  origin?: NodeOrigin;
  position: XYPosition;
  type?: string;
  zIndex?: number;
}

export interface ExportedProject {
  cables: JsonifiedCable[];
  nodes: JsonifiedNode[];
  title: string;
}

export interface Project extends ExportedProject {
  dateAccessed: number;
  dateCreated: number;
}

interface ProjectsDB extends DBSchema {
  proj: {
    indexes: {
      "by-date-accessed": number;
    };
    key: string;
    value: Project;
  };
}

let db: IDBPDatabase<ProjectsDB> | null = null;

const getDb = async () => {
  if (db === null) {
    db = await openDB<ProjectsDB>(DB_NAME, LATEST_VERSION, {
      upgrade(database) {
        const store = database.createObjectStore("proj");

        store.createIndex("by-date-accessed", prop<Project>("dateAccessed"));
      },
    });
  }

  return db;
};

const getTransaction = async <Mode extends IDBTransactionMode = "readonly">(mode?: Mode) => {
  return (await getDb()).transaction<"proj", Mode>("proj", mode ?? ("readonly" as Mode));
};

/**
 * Must provide previousActiveId internally to ensure it is valid before
 * state updates on activeProject.
 */
const txOpenProject = async (
  tx: IDBPTransaction<ProjectsDB, ["proj"], "readwrite">,
  id: string,
  prevActiveId?: null | string,
) => {
  if (!(await tx.store.getAllKeys()).includes(id)) {
    console.error(`Project with ID '${id}' does not exist`);
    return;
  }

  if (activeProject.id !== null) {
    const activeProjectEntry = await tx.store.get(activeProject.id);

    if (activeProjectEntry !== undefined) {
      activeProjectEntry.dateAccessed = Date.now();

      await tx.store.put(activeProjectEntry, activeProject.id);
    }
  }

  previousActiveProjectId = prevActiveId !== undefined ? prevActiveId : activeProject.id;

  activeProject.id = id;

  const newProj = await tx.store.get(id);
  if (newProj !== undefined) {
    activeProject.title = newProj.title;

    newProj.dateAccessed = Date.now();

    await tx.store.put(newProj, id);
  }
};

const txCreateNewProject = async (
  tx: IDBPTransaction<ProjectsDB, ["proj"], "readwrite">,
  title?: string,
) => {
  const projectIds = await tx.store.getAllKeys();

  let id = Math.random().toFixed(5);

  while (projectIds.includes(id)) {
    id = Math.random().toFixed(5);
  }

  const now = Date.now();

  await tx.store.add(
    {
      cables: [],
      dateAccessed: now,
      dateCreated: now,
      nodes: [],
      title: title ?? `welcome to wisl (${id})`,
    },
    id,
  );

  return id;
};

const openMostRecentProject = async () => {
  const tx = await getTransaction("readwrite");

  const projectIDsDateAscending = await tx.store.index("by-date-accessed").getAllKeys();

  if (projectIDsDateAscending.length === 0) {
    const id = await txCreateNewProject(tx);
    await txOpenProject(tx, id);
  } else {
    await txOpenProject(tx, projectIDsDateAscending.at(-1)!);
  }

  void (await tx.done);
};

const jsonifyNode = (node: Node) => {
  return {
    data: {},
    id: node.id,
    measured: node.measured,
    origin: node.origin,
    position: node.position,
    type: node.type,
    zIndex: node.zIndex,
  } satisfies JsonifiedNode;
};

// Effect may call in to save project data before any data has been loaded,
// causing real data to be overwritten with empty data.
// We should block writes until an initial load has been completed.
let blockDataWrites = true;
export const saveProjectFlow = async (id: string, nodes: Node[], cables: Edge[]) => {
  if (blockDataWrites) {
    return;
  }

  const jsonifiedNodes = nodes.map((n) => jsonifyNode(n));
  const jsonifiedCables = cables;

  const tx = await getTransaction("readwrite");
  const project = await tx.store.get(id);

  if (project !== undefined) {
    project.dateAccessed = Date.now();
    project.cables = jsonifiedCables;
    project.nodes = jsonifiedNodes;

    await tx.store.put(project, id);
  } else {
    console.error(`Failed to save data for project ID '${id}': project not found`);
  }

  void (await tx.done);
};

export const loadProjectFlow = async (id: string): Promise<[Node[], Edge[]]> => {
  const project = await (await getDb()).get("proj", id);

  let ret = [[], []] as [Node[], Edge[]];

  if (project !== undefined) {
    ret = [project.nodes, project.cables];
  } else {
    console.error(`Failed to load nodes and cables for project '${id}'`);
  }

  blockDataWrites = false;
  return ret;
};

export const createAndOpenNewProject = async (title: string) => {
  const tx = await getTransaction("readwrite");

  const id = await txCreateNewProject(tx, title);
  await txOpenProject(tx, id);

  void (await tx.done);
};

export const openProject = async (id: string) => {
  const tx = await getTransaction("readwrite");

  await txOpenProject(tx, id);

  void (await tx.done);
};

/**
 * Get project ids and their information.
 * @param numProjects Number of projects to grab. Set to `null` to get all projects
 * @returns Projects sorted by date descending.
 */
export const getProjects = async (numProjects: null | number = null) => {
  const entries = [] as [string, Project][];

  const tx = await getTransaction();

  const projectIDsDateDescending = (
    await tx.store.index("by-date-accessed").getAllKeys()
  ).reverse();
  const numProjectsRequested =
    numProjects === null
      ? projectIDsDateDescending.length
      : Math.min(numProjects, projectIDsDateDescending.length);

  for (let i = 0; i < numProjectsRequested; i++) {
    const id = projectIDsDateDescending[i];
    const entry = await tx.store.get(id);

    if (entry !== undefined) {
      entries.push([id, entry]);
    }
  }

  return entries;
};

export const deleteProject = async (id: string) => {
  const tx = await getTransaction("readwrite");

  const projectIds = await tx.store.getAllKeys();

  if (projectIds.includes(id)) {
    if (activeProject.id === id) {
      const previousActiveId = null;

      if (projectIds.length <= 1) {
        const id = await txCreateNewProject(tx);

        await txOpenProject(tx, id, previousActiveId);
      } else {
        // Open the second most recent project if one exists
        const projectIdsByDateAscending = await tx.store.index("by-date-accessed").getAllKeys();

        await txOpenProject(
          tx,
          projectIdsByDateAscending[projectIdsByDateAscending.length - 2],
          previousActiveId,
        );
      }
    }

    if (previousActiveProjectId === id) {
      previousActiveProjectId = null;
    }

    await tx.store.delete(id);
  }

  void (await tx.done);
};

export const exportProjects = async (ids: string[]) => {
  const tx = await getTransaction();

  const promises = ids.map((id) => tx.store.get(id));

  const projects = await Promise.all(promises);

  const exportedProjects = [];
  for (const project of projects) {
    if (project !== undefined) {
      exportedProjects.push({
        cables: project.cables,
        nodes: project.nodes,
        title: project.title,
      } satisfies ExportedProject);
    }
  }

  return JSON.stringify(exportedProjects);
};

export const importProjects = async (importContents: string) => {
  const tx = await getTransaction("readwrite");
  const promises = [];
  const existingIDs = await tx.store.getAllKeys();
  const now = Date.now();

  try {
    const projects = JSON.parse(importContents) as ExportedProject[];

    // Delay failure to attempt to import as many projects as possible
    let failed = false;

    for (const project of projects) {
      if (
        typeof project.title === "string" &&
        Array.isArray(project.nodes) &&
        Array.isArray(project.cables)
      ) {
        const nodesValid = project.nodes.every((n) => isNode(n));
        const edgesValid = project.cables.every((c) => isEdge(c));

        if (nodesValid && edgesValid) {
          let id = Math.random().toFixed(5);

          while (existingIDs.includes(id)) {
            id = Math.random().toFixed(5);
          }

          promises.push(tx.store.add({ ...project, dateAccessed: now, dateCreated: now }, id));
        } else {
          failed = true;
        }
      } else {
        failed = true;
      }
    }

    if (failed) {
      throw Error("Failed to import projects: invalid data structure");
    }
  } catch (error) {
    console.error("Failed to import projects", error);
    sendNotification("Failed to import projects. Please try again.", "error");
  }

  await Promise.all(promises);
  void (await tx.done);
};

export const renameProject = async (id: string, newTitle: string) => {
  const tx = await getTransaction("readwrite");

  const project = await tx.store.get(id);

  if (project !== undefined) {
    project.title = newTitle;

    await tx.store.put(project, id);
  }

  if (id === activeProject.id) {
    activeProject.title = newTitle;
  }

  void (await tx.done);
};

$effect.root(() => {
  (async () => {
    await openMostRecentProject();
  })();
});
