// @ts-ignore
global.fetch = require("node-fetch");
import { request as gFetch } from "graphql-request";

const lobby: {
  [name: string]: any
} = {};

class Commands {
  private commands = new Map();

  constructor(public client: any) {
    this.commands.set("join", this.join);
  }

  public resolve(target: any, context: any, msg: string) {
    const message = msg.toLowerCase();

    if (message.startsWith("!")) {
      const [ command, ...args ] = message.replace("!", "").split(" ");
      if (this.commands.has(command)) Reflect.apply(this.commands.get(command), this, [target, context, args]);
    } else if (context["msg-id"] === "highlighted-message") {
      this.highlightMessage(context, msg);
    }
  }

  private join(target: any, context: any) {
    fetch(`https://api.twitch.tv/kraken/users?login=${context.username}`, {
      // @ts-ignore
      headers: {
        "Accept": "application/vnd.twitchtv.v5+json",
        "Client-ID": process.env.CLIENT_ID
      }
    })
    .then(res => res.json())
    .then(({ users: [user] }) => {
      const { display_name, name, logo } = user;
      lobby[name] = { display_name, logo };

      gFetch("http://localhost:5001/v1/graphql", /* GraphQL */`
        mutation InsertMove($user: String) {
          insert_moves_one(object: {move: 10, user: $user}) {
            id
            user
          }
        }
      `, {
        user: name
      });

      this.client.say(target, `Current lobby: ${Object.keys(lobby).join(" - ")}`)
    });
  }

  private highlightMessage(context: any, message: any) {
    fetch(`https://api.twitch.tv/kraken/users?login=${context.username}`, {
      // @ts-ignore
      headers: {
        "Accept": "application/vnd.twitchtv.v5+json",
        "Client-ID": process.env.CLIENT_ID
      }
    })
    .then(res => res.json())
    .then(({ users: [user] }) => {
      const { display_name, name, logo } = user;

      gFetch("http://localhost:5001/v1/graphql", /* GraphQL */`
        mutation InsertHighlightedMessage($display_name: String, $logo: String, $name: String, $message: String) {
          insert_highlighted_messages_one(object: {display_name: $display_name, logo: $logo, name: $name, message: $message}) {
            id
            logo
            name
            display_name
          }
        }
      `, {
        display_name,
        name,
        logo,
        message
      });
    });
  }
}

export default Commands;
