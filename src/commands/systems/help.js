import { SlashCommandBuilder } from "discord.js";
import commandRegistry from "../commandRegistry.js";
export default {category:"core",data:new SlashCommandBuilder().setName("help").setDescription("Show available commands."),async execute(client,i){const list=commandRegistry.toJSON().map(c=>`**/${c.name}** — ${c.description}`).join("\n");return i.reply({content:`🌙 **Nocthera**\n\n${list}`.slice(0,2000),flags:64});}};
