<script lang="ts" module>
  import { IconButton, Portal, Surface } from "../../components";

  export type NotificationKind = "error" | "info";

  export interface NotificationInfo {
    kind: NotificationKind;
    message: string;
  }

  interface NotificationState {
    notifications: Record<string, NotificationInfo>;
  }

  const notificationState = $state<NotificationState>({
    notifications: {},
  });

  const post = (message: string, kind: NotificationKind) => {
    let id = Math.random().toFixed(5);
    while (id in notificationState) {
      id = Math.random().toFixed(5);
    }

    notificationState.notifications[id] = { kind, message };
  };

  export const postNotification = (message: string) => {
    post(message, "info");
  };

  export const postError = (message: string) => {
    post(message, "error");
  };
</script>

{#if Object.entries(notificationState.notifications).length > 0}
  <Portal class="notification-container">
    {#each Object.entries(notificationState.notifications) as [id, info] (id)}
      <Surface style="position: relative;">
        <IconButton
          style="position: absolute; top: 2px; right: 2px;"
          name="x-circle"
          onclick={() => delete notificationState.notifications[id]}
          aria-label="close"
        />
        <div
          class="notification-header"
          style="border-bottom-color: {info.kind === 'error'
            ? 'red'
            : 'var(--color-highlight-blue)'}"
        >
          {info.kind === "error" ? "Error" : "Info"}
        </div>
        <p style="font-size: 12px; margin-top: 8px;">{info.message}</p>
      </Surface>
    {/each}
  </Portal>
{/if}

<style>
  :global(.notification-container) {
    position: absolute;
    bottom: 0px;
    right: 0px;
    z-index: 9999;
    width: 25vw;
    max-height: 50vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 4px;
    margin-right: 4px;
  }

  :global(.notification-header) {
    border-bottom: 3px solid var(--color-highlight-blue);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  @media screen and (max-width: 768px) {
    :global(.notification-container) {
      width: 50vw;
    }
  }
</style>
