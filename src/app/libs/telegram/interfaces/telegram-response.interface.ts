interface PeerUser {
	CONSTRUCTOR_ID: number;
	SUBCLASS_OF_ID: number;
	className: string;
	classType: string;
	userId: bigint; // Используем специальный тип для больших чисел
}

interface MessageEntityBotCommand {
	CONSTRUCTOR_ID: number;
	SUBCLASS_OF_ID: number;
	className: string;
	classType: string;
	offset: number;
	length: number;
}

interface Message {
	CONSTRUCTOR_ID: number;
	SUBCLASS_OF_ID: number;
	className: string;
	classType: string;
	out: boolean;
	mentioned: boolean;
	mediaUnread: boolean;
	silent: boolean;
	post?: boolean;
	fromScheduled?: boolean;
	legacy?: boolean;
	editHide?: boolean;
	ttlPeriod: number | null;
	id: number;
	fromId: PeerUser | null;
	peerId: PeerUser | null;
	fwdFrom: null | any; // Если структура данных для fwdFrom известна, можно создать отдельный интерфейс
	viaBotId: number | null;
	replyTo: null | any; // Если структура данных для replyTo известна, можно создать отдельный интерфейс
	date: number;
	message: string;
	media: any | null; // Если media имеет известную структуру, можно создать отдельный интерфейс
	replyMarkup: any | null; // Аналогично, если структура известна
	entities: MessageEntityBotCommand[] | null;
	views?: number | null;
	forwards?: number | null;
	replies?: number | null;
	editDate?: number | null;
	pinned?: boolean;
	postAuthor?: string | null;
	groupedId?: number | null;
	restrictionReason?: string | null;
	action?: any; // Если структура action известна, можно создать отдельный интерфейс
	noforwards?: boolean;
	reactions?: any | null; // Если структура известна
	flags?: number | null;
	invertMedia?: boolean;
	flags2?: number | null;
	offline?: boolean;
	fromBoostsApplied?: any | null;
	savedPeerId?: any | null;
	viaBusinessBotId?: any | null;
	quickReplyShortcutId?: any | null;
	effect?: any | null;
	factcheck?: any | null;
}

// Пример использования:
export type ITelegramResposne = Message;
