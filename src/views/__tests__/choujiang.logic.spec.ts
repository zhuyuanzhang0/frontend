import { describe, expect, it } from 'vitest'

import {
  addPrizeConfig,
  completeLotteryDraw,
  getAvailableUsers,
  getCurrentPrizeWinners,
  parseUserList,
  removePrizeConfig,
  validateLotteryStart,
  type PrizeConfig,
} from '../choujiang.logic'

describe('choujiang.logic', () => {
  it('parses users by trimming whitespace and dropping blank lines', () => {
    const result = parseUserList(' Alice \n\n Bob\n  \nCarol  ')

    expect(result).toEqual(['Alice', 'Bob', 'Carol'])
  })

  it('filters out users who have already won any prize', () => {
    const users = ['Alice', 'Bob', 'Carol', 'David']
    const lotteryResults = {
      1: ['Bob'],
      2: ['Carol'],
    }

    expect(getAvailableUsers(users, lotteryResults)).toEqual(['Alice', 'David'])
  })

  it('adds a new prize with an injected id generator', () => {
    const prizeConfigs: PrizeConfig[] = [{ id: 1, name: '一等奖', count: 1 }]

    const result = addPrizeConfig(prizeConfigs, () => 99)

    expect(result).toEqual([
      { id: 1, name: '一等奖', count: 1 },
      { id: 99, name: '新奖项2', count: 1 },
    ])
  })

  it('removes prize results and clamps the current index when deleting a prize', () => {
    const result = removePrizeConfig({
      prizeConfigs: [
        { id: 1, name: '一等奖', count: 1 },
        { id: 2, name: '二等奖', count: 2 },
      ],
      lotteryResults: {
        1: ['Alice'],
        2: ['Bob'],
      },
      currentPrizeIndex: 1,
      prizeIndex: 1,
    })

    expect(result.prizeConfigs).toEqual([{ id: 1, name: '一等奖', count: 1 }])
    expect(result.lotteryResults).toEqual({ 1: ['Alice'] })
    expect(result.currentPrizeIndex).toBe(0)
  })

  it('reports a full prize before starting the lottery', () => {
    const currentPrize = { id: 1, name: '一等奖', count: 1 }

    const result = validateLotteryStart({
      currentPrize,
      userList: ['Alice', 'Bob'],
      lotteryResults: { 1: ['Alice'] },
      availableUsers: ['Bob'],
    })

    expect(result).toBe('PRIZE_LIMIT_REACHED')
  })

  it('returns empty winners when there is no current prize', () => {
    expect(getCurrentPrizeWinners(undefined, { 1: ['Alice'] })).toEqual([])
  })

  it('completes a draw deterministically and appends the winner to the prize results', () => {
    const currentPrize = { id: 2, name: '二等奖', count: 2 }

    const result = completeLotteryDraw({
      currentPrize,
      lotteryResults: { 1: ['Alice'], 2: ['Bob'] },
      availableUsers: ['Carol', 'David'],
      random: () => 0.6,
    })

    expect(result.errorCode).toBeNull()
    expect(result.winner).toBe('David')
    expect(result.lotteryResults).toEqual({
      1: ['Alice'],
      2: ['Bob', 'David'],
    })
  })

  it('returns no available users when the candidate list is empty', () => {
    const result = completeLotteryDraw({
      currentPrize: { id: 3, name: '三等奖', count: 3 },
      lotteryResults: {},
      availableUsers: [],
    })

    expect(result.errorCode).toBe('NO_AVAILABLE_USERS')
    expect(result.winner).toBe('')
    expect(result.lotteryResults).toEqual({})
  })
})
