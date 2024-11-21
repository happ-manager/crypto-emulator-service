export function checkBlackList(text: string, blackList: string[]) {
	for (const blacklistedWord of blackList) {
		if (text.includes(blacklistedWord)) {
			return false; // Если слово найдено, возвращаем false
		}
	}

	return true;
}
