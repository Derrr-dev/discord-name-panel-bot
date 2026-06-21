import {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type Message,
  type ButtonInteraction,
  type ModalSubmitInteraction,
  type Interaction,
  PermissionsBitField,
} from "discord.js";

const OWNER_ID = process.env.DISCORD_OWNER_ID;
const TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!TOKEN) {
  console.error("DISCORD_BOT_TOKEN tidak ditemukan!");
  process.exit(1);
}

if (!OWNER_ID) {
  console.warn("DISCORD_OWNER_ID tidak ditemukan, command !changename tidak akan berfungsi");
}

function createNamePanel(): {
  embeds: EmbedBuilder[];
  components: ActionRowBuilder<ButtonBuilder>[];
} {
  const embed = new EmbedBuilder()
    .setTitle("🎭 Panel Ganti Nama")
    .setDescription(
      "Klik tombol di bawah untuk mengganti nickname kamu di server ini.\n\n" +
      "**Catatan:** Nickname hanya berlaku di server ini, bukan username globalmu."
    )
    .setColor(0x5865f2)
    .setFooter({ text: "Panel dibuat oleh owner server" })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("open_rename_modal")
      .setLabel("✏️ Ganti Nama Saya")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("reset_name")
      .setLabel("🔄 Reset ke Default")
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row] };
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("clientReady", () => {
  console.log(`✅ Discord bot sudah online: ${client.user?.tag}`);
});

client.on("messageCreate", async (message: Message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  if (message.content.toLowerCase() === "!changename") {
    if (message.author.id !== OWNER_ID) {
      await message.reply({ content: "❌ Hanya owner yang bisa menggunakan command ini." });
      return;
    }

    try {
      const panel = createNamePanel();
      if ("send" in message.channel) {
        await message.channel.send(panel);
      }
      await message.delete().catch(() => {});
    } catch (err) {
      console.error("Gagal mengirim panel:", err);
      await message.reply("❌ Gagal mengirim panel. Pastikan bot punya izin yang cukup.");
    }
  }
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (interaction.isButton()) {
    await handleButton(interaction as ButtonInteraction);
  } else if (interaction.isModalSubmit()) {
    await handleModal(interaction as ModalSubmitInteraction);
  }
});

async function handleButton(interaction: ButtonInteraction): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({ content: "❌ Hanya bisa digunakan di dalam server.", ephemeral: true });
    return;
  }

  if (interaction.customId === "open_rename_modal") {
    const modal = new ModalBuilder()
      .setCustomId("rename_modal")
      .setTitle("Ganti Nickname Kamu");

    const nameInput = new TextInputBuilder()
      .setCustomId("new_name")
      .setLabel("Nickname Baru")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Masukkan nickname baru kamu...")
      .setMinLength(1)
      .setMaxLength(32)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput));
    await interaction.showModal(modal);

  } else if (interaction.customId === "reset_name") {
    const member = interaction.guild.members.cache.get(interaction.user.id);
    if (!member) {
      await interaction.reply({ content: "❌ Gagal menemukan datamu di server ini.", ephemeral: true });
      return;
    }

    const botMember = interaction.guild.members.me;
    if (!botMember?.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
      await interaction.reply({ content: "❌ Bot tidak punya izin **Manage Nicknames**.", ephemeral: true });
      return;
    }

    if (member.roles.highest.position >= (botMember.roles.highest?.position ?? 0)) {
      await interaction.reply({ content: "❌ Bot tidak bisa mengubah nickname member dengan role lebih tinggi.", ephemeral: true });
      return;
    }

    try {
      await member.setNickname(null, "Direset oleh panel bot");
      await interaction.reply({ content: "✅ Nicknamu berhasil direset ke default!", ephemeral: true });
    } catch (err) {
      console.error("Gagal reset nickname:", err);
      await interaction.reply({ content: "❌ Gagal mereset nickname.", ephemeral: true });
    }
  }
}

async function handleModal(interaction: ModalSubmitInteraction): Promise<void> {
  if (interaction.customId !== "rename_modal") return;
  if (!interaction.guild) {
    await interaction.reply({ content: "❌ Hanya bisa digunakan di dalam server.", ephemeral: true });
    return;
  }

  const newName = interaction.fields.getTextInputValue("new_name").trim();
  if (!newName) {
    await interaction.reply({ content: "❌ Nama tidak boleh kosong.", ephemeral: true });
    return;
  }

  const member = interaction.guild.members.cache.get(interaction.user.id);
  if (!member) {
    await interaction.reply({ content: "❌ Gagal menemukan datamu di server ini.", ephemeral: true });
    return;
  }

  const botMember = interaction.guild.members.me;
  if (!botMember?.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
    await interaction.reply({ content: "❌ Bot tidak punya izin **Manage Nicknames**.", ephemeral: true });
    return;
  }

  if (member.roles.highest.position >= (botMember.roles.highest?.position ?? 0)) {
    await interaction.reply({ content: "❌ Bot tidak bisa mengubah nickname member dengan role lebih tinggi.", ephemeral: true });
    return;
  }

  try {
    const oldName = member.nickname ?? member.user.username;
    await member.setNickname(newName, "Diganti sendiri melalui panel bot");
    await interaction.reply({ content: `✅ Nicknamu berhasil diganti dari **${oldName}** menjadi **${newName}**!`, ephemeral: true });
  } catch (err) {
    console.error("Gagal ganti nickname:", err);
    await interaction.reply({ content: "❌ Gagal mengganti nickname.", ephemeral: true });
  }
}

client.login(TOKEN);
