/**
 * Debt Simplification & Split Calculator
 */

export function calculateNetBalances(expenses, settlements, members) {
  const balances = {}
  members.forEach(m => { balances[m._id] = 0 })

  expenses.forEach(expense => {
    const paidBy = expense.paidBy
    const splits = expense.splits || []
    if (balances[paidBy] !== undefined) balances[paidBy] += expense.amount
    splits.forEach(split => {
      if (balances[split.memberId] !== undefined) balances[split.memberId] -= split.amount
    })
  })

  settlements.forEach(s => {
    if (balances[s.from] !== undefined) balances[s.from] += s.amount
    if (balances[s.to] !== undefined) balances[s.to] -= s.amount
  })

  return balances
}

export function simplifyDebts(balances) {
  const creditors = []
  const debtors = []

  Object.entries(balances).forEach(([id, balance]) => {
    const rounded = Math.round(balance * 100) / 100
    if (rounded > 0.01) creditors.push({ id, amount: rounded })
    else if (rounded < -0.01) debtors.push({ id, amount: Math.abs(rounded) })
  })

  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const transactions = []
  let i = 0, j = 0

  while (i < creditors.length && j < debtors.length) {
    const credit = creditors[i]
    const debt = debtors[j]
    const amount = Math.min(credit.amount, debt.amount)

    if (amount > 0.01) {
      transactions.push({
        from: debt.id,
        to: credit.id,
        amount: Math.round(amount * 100) / 100
      })
    }

    credit.amount -= amount
    debt.amount -= amount

    if (credit.amount < 0.01) i++
    if (debt.amount < 0.01) j++
  }

  return transactions
}

export function calculateSplits(amount, splitType, selectedMembers, manualSplits, percentageSplits) {
  const splits = []

  if (splitType === 'equal') {
    const share = Math.floor((amount / selectedMembers.length) * 100) / 100
    const remainder = Math.round((amount - share * selectedMembers.length) * 100) / 100
    selectedMembers.forEach((memberId, idx) => {
      splits.push({ memberId, amount: idx === 0 ? share + remainder : share })
    })
  } else if (splitType === 'manual') {
    selectedMembers.forEach(memberId => {
      splits.push({ memberId, amount: Math.round((Number(manualSplits[memberId] || 0)) * 100) / 100 })
    })
  } else if (splitType === 'percentage') {
    selectedMembers.forEach(memberId => {
      const pct = Number(percentageSplits[memberId] || 0)
      splits.push({ memberId, amount: Math.round((amount * pct / 100) * 100) / 100 })
    })
  }

  return splits
}

export function getMemberStats(memberId, expenses, settlements) {
  const paid = expenses.filter(e => e.paidBy === memberId).reduce((s, e) => s + e.amount, 0)
  const share = expenses.flatMap(e => e.splits || []).filter(s => s.memberId === memberId).reduce((s, sp) => s + sp.amount, 0)
  return { paid, share, net: Math.round((paid - share) * 100) / 100 }
}
