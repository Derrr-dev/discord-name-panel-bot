const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField } = require("discord.js");

const OWNER_ID = process.env.DISCORD_OWNER_ID;
const TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!TOKEN) { console.error("❌ DISCORD_BOT_TOKEN tidak ditemukan!"); process.exit(1); }
if (!OWNER_ID) console.warn("⚠️  DISCORD_OWNER_ID tidak ditemukan, command !changename tidak akan berfungsi");

function createNamePanel() {
  const embed = new EmbedBuilder()
    .setTitle("🎭 Panel Ganti Nama")
    .setDescription("Klik tombol di bawah untuk mengganti nickname kamu di server ini.\n\n**Catatan:** Nickname hanya berlaku di server ini, bukan username globalmu.")
    .setColor(0x5865f2)
    .setFooter({ text: "Panel dibuat oleh owner server" })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("open_rename_modal").setLabel("✏️ Ganti Nama Saya").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("reset_name").setLabel("🔄 Reset ke Default").setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [row] };
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
});

client.once("clientReady", () => console.log("✅ Bot online: " + client.user.tag));

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
  if (message.content.toLowerCase() === "!changename") {
    if (message.author.id !== OWNER_ID) {
      return message.reply({ content: "❌ Hanya owner yang bisa menggunakan command ini." });
    }
    try {
      if ("send" in message.channel) await message.channel.send(createNamePanel());
      await message.delete().catch(() => {});
    } catch (err) {
      console.error("Gagal kirim panel:", err);
      message.reply("❌ Gagal mengirim panel. Pastikan bot punya izin yang cukup.");
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) return handleButton(interaction);
  if (interaction.isModalSubmit()) return handleModal(interaction);
});

async function handleButton(interaction) {
  if (!interaction.guild) return interaction.reply({ content: "❌ Hanya bisa digunakan di dalam server.", ephemeral: true });

  if (interaction.customId === "open_rename_modal") {
    const modal = new ModalBuilder().setCustomId("rename_modal").setTitle("Ganti Nickname Kamu");
    const input = new TextInputBuilder().setCustomId("new_name").setLabel("Nickname Baru").setStyle(TextInputStyle.Short).setPlaceholder("Masukkan nickname baru kamu...").setMinLength(1).setMaxLength(32).setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return interaction.showModal(modal);
  }

  if (interaction.customId === "reset_name") {
    const member = interaction.guild.members.cache.get(interaction.user.id);
    if (!member) return interaction.reply({ content: "❌ Gagal menemukan datamu.", ephemeral: true });
    const bot = interaction.guild.members.me;
    if (!bot?.permissions.has(PermissionsBitField.Flags.ManageNicknames)) return interaction.reply({ content: "❌ Bot tidak punya izin Manage Nicknames.", ephemeral: true });
    if (member.roles.highest.position >= (bot.roles.highest?.position ?? 0)) return interaction.reply({ content: "❌ Bot tidak bisa ubah nickname member dengan role lebih tinggi.", ephemeral: true });
    try {
      await member.setNickname(null);
      interaction.reply({ content: "✅ Nicknamu berhasil direset ke default!", ephemeral: true });
    } catch (err) {
      console.error("Gagal reset:", err);
      interaction.reply({ content: "❌ Gagal mereset nickname.", ephemeral: true });
    }
  }
}

async function handleModal(interaction) {
  if (interaction.customId !== "rename_modal" || !interaction.guild) return;
  const newName = interaction.fields.getTextInputValue("new_name").trim();
  if (!newName) return interaction.reply({ content: "❌ Nama tidak boleh kosong.", ephemeral: true });
  const member = interaction.guild.members.cache.get(interaction.user.id);
  if (!member) return interaction.reply({ content: "❌ Gagal menemukan datamu.", ephemeral: true });
  const bot = interaction.guild.members.me;
  if (!bot?.permissions.has(PermissionsBitField.Flags.ManageNicknames)) return interaction.reply({ content: "❌ Bot tidak punya izin Manage Nicknames.", ephemeral: true });
  if (member.roles.highest.position >= (bot.roles.highest?.position ?? 0)) return interaction.reply({ content: "❌ Bot tidak bisa ubah nickname member dengan role lebih tinggi.", ephemeral: true });
  try {
    const oldName = member.nickname ?? member.user.username;
    await member.setNickname(newName);
    interaction.reply({ content: "✅ Nickname berhasil diganti dari **" + oldName + "** menjadi **" + newName + "**!", ephemeral: true });
  } catch (err) {
    console.error("Gagal ganti nama:", err);
    interaction.reply({ content: "❌ Gagal mengganti nickname.", ephemeral: true });
  }
}

client.login(TOKEN);
