<template>
  <div id="app">
    <ul>
      <li v-for="msg in messages" :key="msg.id">
        <img :src="msg.logo" alt="msg.message" />
        {{ msg.display_name }}: {{ msg.message }}
      </li>
    </ul>
  </div>
</template>

<script>
import { SubscriptionClient } from "subscriptions-transport-ws";
import { watchEffect, ref } from "vue";

const wsclient = new SubscriptionClient("ws://localhost:5001/v1/graphql", {
  reconnect: true,
});

export default {
  name: "App",
  setup() {
    const messages = ref([]);

    watchEffect(() => {
      wsclient
        .request({
          query: /* GraphQL */ `
            subscription MySubscription {
              highlighted_messages(order_by: { id: desc }) {
                id
                display_name
                name
                logo
                message
              }
            }
          `,
          variables: {},
        })
        .subscribe({
          next: (data) => (messages.value = data.data.highlighted_messages),
          error: console.error,
        });
    });

    return {
      messages,
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
