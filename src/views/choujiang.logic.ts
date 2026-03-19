export interface PrizeConfig {
  id: number
  name: string
  count: number
}

export type LotteryResults = Record<number, string[]>

export type LotteryErrorCode =
  | 'NO_PRIZE'
  | 'NO_USERS'
  | 'PRIZE_LIMIT_REACHED'
  | 'NO_AVAILABLE_USERS'

export interface ValidateLotteryStartParams {
  currentPrize?: PrizeConfig
  userList: string[]
  lotteryResults: LotteryResults
  availableUsers: string[]
}

export interface RemovePrizeConfigParams {
  prizeConfigs: PrizeConfig[]
  lotteryResults: LotteryResults
  currentPrizeIndex: number
  prizeIndex: number
}

export interface CompleteLotteryDrawParams {
  currentPrize?: PrizeConfig
  lotteryResults: LotteryResults
  availableUsers: string[]
  random?: () => number
}

export interface CompleteLotteryDrawResult {
  errorCode: LotteryErrorCode | null
  lotteryResults: LotteryResults
  winner: string
}

export const DEFAULT_USER_TEXT = [
  '张三',
  '李四',
  '王五',
  '赵六',
  '小明',
  '小红',
  '小刚',
  'Lucy',
  'Tom',
  'Jerry',
  '陈晨',
  '林静',
  '周航',
  '许诺',
  '王凯',
].join('\n')

export const DEFAULT_PRIZE_CONFIGS: PrizeConfig[] = [
  { id: 1, name: '一等奖', count: 1 },
  { id: 2, name: '二等奖', count: 2 },
  { id: 3, name: '三等奖', count: 3 },
]

export const DEFAULT_DISPLAY_NAME = '点击开始抽奖'
export const FINISHED_DISPLAY_NAME = '抽奖结束'

export function parseUserList(userText: string) {
  return userText
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function getCurrentPrize(
  prizeConfigs: PrizeConfig[],
  currentPrizeIndex: number,
) {
  return prizeConfigs[currentPrizeIndex]
}

export function getAllWinners(lotteryResults: LotteryResults) {
  return Object.values(lotteryResults).flat()
}

export function getAvailableUsers(
  userList: string[],
  lotteryResults: LotteryResults,
) {
  const winnerSet = new Set(getAllWinners(lotteryResults))
  return userList.filter((user) => !winnerSet.has(user))
}

export function getCurrentPrizeWinners(
  currentPrize: PrizeConfig | undefined,
  lotteryResults: LotteryResults,
) {
  if (!currentPrize) {
    return []
  }

  return lotteryResults[currentPrize.id] ?? []
}

export function addPrizeConfig(
  prizeConfigs: PrizeConfig[],
  createId: () => number = () => Date.now(),
) {
  return [
    ...prizeConfigs,
    {
      id: createId(),
      name: `新奖项${prizeConfigs.length + 1}`,
      count: 1,
    },
  ]
}

export function removePrizeConfig({
  prizeConfigs,
  lotteryResults,
  currentPrizeIndex,
  prizeIndex,
}: RemovePrizeConfigParams) {
  const removedPrize = prizeConfigs[prizeIndex]

  if (!removedPrize) {
    return {
      prizeConfigs,
      lotteryResults,
      currentPrizeIndex,
    }
  }

  const nextPrizeConfigs = prizeConfigs.filter((_, index) => index !== prizeIndex)
  const nextLotteryResults = { ...lotteryResults }

  delete nextLotteryResults[removedPrize.id]

  return {
    prizeConfigs: nextPrizeConfigs,
    lotteryResults: nextLotteryResults,
    currentPrizeIndex:
      nextPrizeConfigs.length === 0
        ? 0
        : Math.min(currentPrizeIndex, nextPrizeConfigs.length - 1),
  }
}

export function validateLotteryStart({
  currentPrize,
  userList,
  lotteryResults,
  availableUsers,
}: ValidateLotteryStartParams): LotteryErrorCode | null {
  if (!currentPrize) {
    return 'NO_PRIZE'
  }

  if (userList.length === 0) {
    return 'NO_USERS'
  }

  if (getCurrentPrizeWinners(currentPrize, lotteryResults).length >= currentPrize.count) {
    return 'PRIZE_LIMIT_REACHED'
  }

  if (availableUsers.length === 0) {
    return 'NO_AVAILABLE_USERS'
  }

  return null
}

export function pickRandomUser(
  users: string[],
  random: () => number = Math.random,
) {
  if (users.length === 0) {
    return undefined
  }

  const randomIndex = Math.min(
    users.length - 1,
    Math.floor(Math.max(0, random()) * users.length),
  )

  return users[randomIndex]
}

export function appendWinner(
  lotteryResults: LotteryResults,
  prizeId: number,
  winner: string,
) {
  return {
    ...lotteryResults,
    [prizeId]: [...(lotteryResults[prizeId] ?? []), winner],
  }
}

export function completeLotteryDraw({
  currentPrize,
  lotteryResults,
  availableUsers,
  random,
}: CompleteLotteryDrawParams): CompleteLotteryDrawResult {
  if (!currentPrize) {
    return {
      errorCode: 'NO_PRIZE',
      lotteryResults,
      winner: '',
    }
  }

  if (getCurrentPrizeWinners(currentPrize, lotteryResults).length >= currentPrize.count) {
    return {
      errorCode: 'PRIZE_LIMIT_REACHED',
      lotteryResults,
      winner: '',
    }
  }

  const winner = pickRandomUser(availableUsers, random)

  if (!winner) {
    return {
      errorCode: 'NO_AVAILABLE_USERS',
      lotteryResults,
      winner: '',
    }
  }

  return {
    errorCode: null,
    lotteryResults: appendWinner(lotteryResults, currentPrize.id, winner),
    winner,
  }
}
