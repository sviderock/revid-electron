import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { User, Users } from "lucide-react";
import { z } from "zod";

const a = {
  "0": {
    groupMetadata: {
      id: {
        server: "g.us",
        user: "120363361141292853",
        _serialized: "120363361141292853@g.us",
      },
      creation: 1734206213,
      owner: {
        server: "c.us",
        user: "380681571034",
        _serialized: "380681571034@c.us",
      },
      subject: "Кєк тест ",
      subjectTime: 1734206213,
      descTime: 0,
      restrict: false,
      announce: false,
      noFrequentlyForwarded: false,
      ephemeralDuration: 0,
      disappearingModeTrigger: "chat_settings",
      membershipApprovalMode: false,
      memberAddMode: "all_member_add",
      reportToAdminMode: false,
      size: 2,
      support: false,
      suspended: false,
      terminated: false,
      uniqueShortNameMap: {},
      isLidAddressingMode: false,
      isParentGroup: false,
      isParentGroupClosed: false,
      defaultSubgroup: false,
      generalSubgroup: false,
      groupSafetyCheck: false,
      generalChatAutoAddDisabled: false,
      allowNonAdminSubGroupCreation: false,
      lastActivityTimestamp: 0,
      lastSeenActivityTimestamp: 0,
      incognito: false,
      hasCapi: false,
      participants: [
        {
          id: {
            server: "c.us",
            user: "380660169422",
            _serialized: "380660169422@c.us",
          },
          isAdmin: false,
          isSuperAdmin: false,
        },
        {
          id: {
            server: "c.us",
            user: "380681571034",
            _serialized: "380681571034@c.us",
          },
          isAdmin: true,
          isSuperAdmin: true,
        },
      ],
      pendingParticipants: [],
      pastParticipants: [],
      membershipApprovalRequests: [],
      subgroupSuggestions: [],
    },
    id: {
      server: "g.us",
      user: "120363361141292853",
      _serialized: "120363361141292853@g.us",
    },
    name: "Кєк тест ",
    isGroup: true,
    isReadOnly: false,
    unreadCount: 0,
    timestamp: 1744279739,
    archived: false,
    pinned: false,
    isMuted: false,
    muteExpiration: 0,
    lastMessage: {
      _data: {
        id: {
          fromMe: true,
          remote: "120363361141292853@g.us",
          id: "8D866853D7E8EDA4029A87BD8B042502",
          participant: {
            server: "c.us",
            user: "380681571034",
            _serialized: "380681571034@c.us",
          },
          _serialized:
            "true_120363361141292853@g.us_8D866853D7E8EDA4029A87BD8B042502_380681571034@c.us",
        },
        rowId: 1000000013,
        viewed: false,
        body: "Вдвт",
        type: "chat",
        t: 1744279739,
        from: {
          server: "c.us",
          user: "380681571034",
          _serialized: "380681571034@c.us",
        },
        to: {
          server: "g.us",
          user: "120363361141292853",
          _serialized: "120363361141292853@g.us",
        },
        author: {
          server: "c.us",
          user: "380681571034",
          _serialized: "380681571034@c.us",
        },
        ack: 2,
        invis: true,
        star: false,
        kicNotified: false,
        isFromTemplate: false,
        pollOptions: [],
        pollInvalidated: false,
        pollVotesSnapshot: {
          pollVotes: [],
        },
        latestEditMsgKey: null,
        latestEditSenderTimestampMs: null,
        mentionedJidList: [],
        groupMentions: [],
        eventInvalidated: false,
        isVcardOverMmsDocument: false,
        isForwarded: false,
        hasReaction: false,
        viewMode: "VISIBLE",
        messageSecret: {
          "0": 224,
          "1": 16,
          "2": 33,
          "3": 145,
          "4": 193,
          "5": 199,
          "6": 64,
          "7": 182,
          "8": 151,
          "9": 108,
          "10": 226,
          "11": 100,
          "12": 10,
          "13": 92,
          "14": 226,
          "15": 114,
          "16": 190,
          "17": 192,
          "18": 124,
          "19": 53,
          "20": 221,
          "21": 211,
          "22": 90,
          "23": 96,
          "24": 228,
          "25": 169,
          "26": 232,
          "27": 43,
          "28": 225,
          "29": 216,
          "30": 43,
          "31": 161,
        },
        productHeaderImageRejected: false,
        lastPlaybackProgress: 0,
        isDynamicReplyButtonsMsg: false,
        isCarouselCard: false,
        parentMsgId: null,
        callSilenceReason: null,
        isVideoCall: false,
        callDuration: null,
        callParticipants: null,
        isMdHistoryMsg: false,
        stickerSentTs: 0,
        isAvatar: false,
        lastUpdateFromServerTs: 0,
        invokedBotWid: null,
        bizBotType: null,
        botResponseTargetId: null,
        botPluginType: null,
        botPluginReferenceIndex: null,
        botPluginSearchProvider: null,
        botPluginSearchUrl: null,
        botPluginSearchQuery: null,
        botPluginMaybeParent: false,
        botReelPluginThumbnailCdnUrl: null,
        botMsgBodyType: null,
        requiresDirectConnection: false,
        bizContentPlaceholderType: null,
        hostedBizEncStateMismatch: false,
        senderOrRecipientAccountTypeHosted: false,
        placeholderCreatedWhenAccountIsHosted: false,
        links: [],
      },
      id: {
        fromMe: true,
        remote: "120363361141292853@g.us",
        id: "8D866853D7E8EDA4029A87BD8B042502",
        participant: {
          server: "c.us",
          user: "380681571034",
          _serialized: "380681571034@c.us",
        },
        _serialized:
          "true_120363361141292853@g.us_8D866853D7E8EDA4029A87BD8B042502_380681571034@c.us",
      },
      ack: 2,
      hasMedia: false,
      body: "Вдвт",
      type: "chat",
      timestamp: 1744279739,
      from: "380681571034@c.us",
      to: "120363361141292853@g.us",
      author: "380681571034@c.us",
      deviceType: "android",
      isForwarded: false,
      forwardingScore: 0,
      isStatus: false,
      isStarred: false,
      fromMe: true,
      hasQuotedMsg: false,
      hasReaction: false,
      vCards: [],
      mentionedIds: [],
      groupMentions: [],
      isGif: false,
      links: [],
    },
  },
  "1": {
    id: {
      server: "c.us",
      user: "380501384358",
      _serialized: "380501384358@c.us",
    },
    name: "Олександр Петрович 128",
    isGroup: false,
    isReadOnly: false,
    unreadCount: 0,
    timestamp: 1744191927,
    archived: false,
    pinned: false,
    isMuted: false,
    muteExpiration: 0,
    lastMessage: {
      _data: {
        id: {
          fromMe: false,
          remote: "380501384358@c.us",
          id: "3A0AD1044D5202E100CB",
          _serialized: "false_380501384358@c.us_3A0AD1044D5202E100CB",
        },
        rowId: 999999970,
        viewed: false,
        body: "Так",
        type: "chat",
        t: 1744191927,
        from: {
          server: "c.us",
          user: "380501384358",
          _serialized: "380501384358@c.us",
        },
        to: {
          server: "c.us",
          user: "380681571034",
          _serialized: "380681571034@c.us",
        },
        ack: 0,
        invis: true,
        star: false,
        kicNotified: false,
        isFromTemplate: false,
        pollOptions: [],
        pollInvalidated: false,
        pollVotesSnapshot: {
          pollVotes: [],
        },
        latestEditMsgKey: null,
        latestEditSenderTimestampMs: null,
        broadcast: false,
        mentionedJidList: [],
        groupMentions: [],
        eventInvalidated: false,
        isVcardOverMmsDocument: false,
        isForwarded: false,
        hasReaction: false,
        viewMode: "VISIBLE",
        messageSecret: {
          "0": 139,
          "1": 24,
          "2": 155,
          "3": 134,
          "4": 130,
          "5": 54,
          "6": 77,
          "7": 120,
          "8": 181,
          "9": 15,
          "10": 103,
          "11": 81,
          "12": 63,
          "13": 22,
          "14": 188,
          "15": 72,
          "16": 167,
          "17": 61,
          "18": 147,
          "19": 231,
          "20": 242,
          "21": 31,
          "22": 185,
          "23": 239,
          "24": 5,
          "25": 1,
          "26": 86,
          "27": 46,
          "28": 232,
          "29": 14,
          "30": 104,
          "31": 80,
        },
        productHeaderImageRejected: false,
        lastPlaybackProgress: 0,
        isDynamicReplyButtonsMsg: false,
        isCarouselCard: false,
        parentMsgId: null,
        callSilenceReason: null,
        isVideoCall: false,
        callDuration: null,
        callParticipants: null,
        isMdHistoryMsg: true,
        stickerSentTs: 0,
        isAvatar: false,
        lastUpdateFromServerTs: 0,
        invokedBotWid: null,
        botTargetSenderJid: null,
        bizBotType: null,
        botResponseTargetId: null,
        botPluginType: null,
        botPluginReferenceIndex: null,
        botPluginSearchProvider: null,
        botPluginSearchUrl: null,
        botPluginSearchQuery: null,
        botPluginMaybeParent: false,
        botReelPluginThumbnailCdnUrl: null,
        botMsgBodyType: null,
        requiresDirectConnection: false,
        bizContentPlaceholderType: null,
        hostedBizEncStateMismatch: false,
        senderOrRecipientAccountTypeHosted: false,
        placeholderCreatedWhenAccountIsHosted: false,
        links: [],
      },
      id: {
        fromMe: false,
        remote: "380501384358@c.us",
        id: "3A0AD1044D5202E100CB",
        _serialized: "false_380501384358@c.us_3A0AD1044D5202E100CB",
      },
      ack: 0,
      hasMedia: false,
      body: "Так",
      type: "chat",
      timestamp: 1744191927,
      from: "380501384358@c.us",
      to: "380681571034@c.us",
      deviceType: "ios",
      isForwarded: false,
      forwardingScore: 0,
      isStatus: false,
      isStarred: false,
      broadcast: false,
      fromMe: false,
      hasQuotedMsg: false,
      hasReaction: false,
      vCards: [],
      mentionedIds: [],
      groupMentions: [],
      isGif: false,
      links: [],
    },
  },
};

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  params: zodValidator(z.object({ chatId: z.string().optional() })),
  loader: async ({ context: { queryClient, trpc } }) => {
    return queryClient.ensureQueryData(trpc.getChats.queryOptions());
  },
});

function Dashboard() {
  const chats = Route.useLoaderData();
  const params = Route.useParams();
  const { trpc } = Route.useRouteContext();

  const headerTitle = params.chatId
    ? chats.find((chat) => chat.id._serialized === params.chatId)?.name
    : "";

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent className="px-4 py-4">
          <SidebarGroup className="gap-2">
            <SidebarGroupLabel className="font-semibold text-xl">Chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {chats.map((chat) => (
                  <SidebarMenuButton
                    asChild
                    isActive={chat.id._serialized === params.chatId}
                    key={chat.id._serialized}
                    className="gap-4 rounded-lg bg-sidebar-accent transition-all hover:bg-sidebar-primary/30 hover:ring-primary"
                  >
                    <Link to="/dashboard/$chatId" params={{ chatId: chat.id._serialized }}>
                      <Avatar className="size-10 border-2 border-sidebar">
                        <AvatarImage src={chat.profilePicUrl} alt={chat.name} />
                        <AvatarFallback>
                          {chat.isGroup ? <User size={20} /> : <Users size={20} />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="font-semibold">{chat.name}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="w-full">
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 truncate">
            <h2 className="flex truncate text-2xl">{headerTitle}</h2>
          </div>
          <Separator orientation="vertical" className="mr-2 h-4" />
          <ModeToggle />
        </header>

        <div className="flex flex-1 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
