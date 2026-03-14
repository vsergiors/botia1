const { 
Client, 
GatewayIntentBits, 
ChannelType, 
PermissionsBitField, 
EmbedBuilder, 
ButtonBuilder, 
ButtonStyle, 
ActionRowBuilder 
} = require("discord.js")

const axios = require("axios")

// VARIABLES DE ENTORNO
const DISCORD_TOKEN = process.env.DISCORD_TOKEN
const API_KEY = process.env.API_KEY

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]
})

client.once("ready", async () => {

console.log(`Bot conectado como ${client.user.tag}`)

await client.application.commands.create({
name: "ia",
description: "Hablar con la IA en un canal privado"
})

})

client.on("interactionCreate", async interaction => {

if (!interaction.isChatInputCommand()) return

if (interaction.commandName === "ia") {

const channel = await interaction.guild.channels.create({
name: `ia-${interaction.user.username}`,
type: ChannelType.GuildText,
permissionOverwrites: [
{
id: interaction.guild.id,
deny: [PermissionsBitField.Flags.ViewChannel]
},
{
id: interaction.user.id,
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
}
]
})

const embed = new EmbedBuilder()
.setTitle("🤖 Chat IA")
.setDescription(
"Este es tu canal privado para hablar con la IA.\n\n" +
"✍️ Escribe cualquier mensaje y la IA responderá.\n\n" +
"🔴 Usa el botón para cerrar el canal."
)
.setColor("#00b0f4")

const boton = new ButtonBuilder()
.setCustomId("cerrar")
.setLabel("Cerrar canal")
.setStyle(ButtonStyle.Danger)

const fila = new ActionRowBuilder().addComponents(boton)

await channel.send({
content: `<@${interaction.user.id}>`,
embeds: [embed],
components: [fila]
})

await interaction.reply({
content: `Tu canal IA fue creado: ${channel}`,
ephemeral: true
})

}

})

client.on("interactionCreate", async interaction => {

if (!interaction.isButton()) return

if (interaction.customId === "cerrar") {

await interaction.channel.delete()

}

})

client.on("messageCreate", async message => {

if (message.author.bot) return
if (!message.channel.name.startsWith("ia-")) return

try {

const response = await axios.post(
"https://api.deepseek.com/chat/completions",
{
model: "deepseek-chat",
messages: [
{
role: "user",
content: message.content
}
]
},
{
headers: {
Authorization: `Bearer ${API_KEY}`,
"Content-Type": "application/json"
}
}
)

const reply = response.data.choices[0].message.content

message.channel.send(reply)

} catch {

message.channel.send("❌ Error al conectar con la IA")

}

})

client.login(DISCORD_TOKEN)
