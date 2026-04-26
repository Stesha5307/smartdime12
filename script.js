const TAGGUN_URL = 'https://taggun.p.rapidapi.com/api/receipt/v1/simple/file';

let receiptTotals = [];
let chartInstance = null;

// ─── Financial Knowledge Base ─────────────────────────────────────────────────

const FINANCE_KNOWLEDGE = {

  budgetingRules: {
    "50/30/20": {
      description: "Split after-tax income: 50% on needs (rent, groceries, utilities, minimum debt payments), 30% on wants (dining out, subscriptions, hobbies), and 20% on savings and investing.",
      origin: "Popularized by Senator Elizabeth Warren in 'All Your Worth' (2005).",
      tip: "If you live in a high cost-of-living city, consider a 60/20/20 split — needs often exceed 50% in places like NYC or San Francisco."
    },
    "payYourselfFirst": {
      description: "Automatically move your savings to a separate account the moment your paycheck arrives — before you pay any bills. This removes the temptation to spend it.",
      tip: "Even $50/month invested at age 22 becomes ~$175,000 by retirement at a 7% return."
    },
    "zeroBased": {
      description: "Assign every dollar of income a job — savings, expenses, investments — until you reach zero. You are not spending to zero; you are planning to zero.",
      tip: "Best for people who want detailed control. Apps like YNAB (You Need A Budget) are built around this method."
    }
  },

  investmentTypes: {
    stocks: {
      name: "Stocks (Equities)",
      riskLevel: "Medium–High",
      avgAnnualReturn: "7–10% (S&P 500 historical avg, inflation-adjusted ~7%)",
      timeHorizon: "5+ years",
      description: "Buying a stock means buying a small ownership stake in a company. As the company grows, your share value rises. Companies may also pay dividends — regular cash payments to shareholders.",
      pros: ["Highest long-term returns of any major asset class", "Dividends provide passive income", "Highly liquid — easy to buy and sell"],
      cons: ["Can lose 30–50% of value in a recession", "Requires emotional discipline to not sell during downturns", "Individual stock picking beats index funds less than 20% of the time"],
      begTip: "For beginners: don't pick individual stocks. Invest in a low-cost index fund like VOO (Vanguard S&P 500 ETF) which holds all 500 top US companies automatically.",
      famousRule: "Warren Buffett's advice for most investors: just buy and hold S&P 500 index funds. He has said this is what his own estate will do for his heirs."
    },
    bonds: {
      name: "Bonds (Fixed Income)",
      riskLevel: "Low–Medium",
      avgAnnualReturn: "2–5%",
      timeHorizon: "1–10 years",
      description: "A bond is a loan you give to a government or corporation. They pay you back with interest (the coupon rate) over a fixed period. US Treasury bonds are backed by the US government and considered the safest investment on earth.",
      pros: ["Stable, predictable income", "Much less volatile than stocks", "US Treasuries have essentially zero default risk", "Good for capital preservation near retirement"],
      cons: ["Lower returns than stocks long-term", "Lose value when interest rates rise", "Inflation can erode real returns"],
      begTip: "A classic rule: hold your age as a % in bonds. Age 30 = 30% bonds. Age 60 = 60% bonds. This reduces risk as you approach retirement.",
      famousRule: "The 'bond tent' strategy: increase bond allocation in the 5 years before and after retirement to protect against a market crash at the worst possible time."
    },
    indexFunds: {
      name: "Index Funds & ETFs",
      riskLevel: "Medium",
      avgAnnualReturn: "7–10% (mirrors the market)",
      timeHorizon: "5–30+ years",
      description: "An index fund automatically holds every stock in a market index (like the S&P 500). Instead of trying to beat the market, you match it. ETFs (Exchange-Traded Funds) work the same way but trade like stocks throughout the day.",
      pros: ["Instant diversification across hundreds of companies", "Extremely low fees (Vanguard VOO charges just 0.03%/year)", "Consistently outperform ~80% of actively managed funds over 10+ years", "No research or stock-picking required"],
      cons: ["You will never beat the market — only match it", "Still falls in recessions like the broader market"],
      begTip: "The 3-fund portfolio: (1) US total market index fund, (2) International index fund, (3) Bond index fund. Simple, diversified, and low cost.",
      famousRule: "Jack Bogle (founder of Vanguard): 'Don't look for the needle in the haystack. Just buy the haystack.' Index funds are his legacy."
    },
    realEstate: {
      name: "Real Estate",
      riskLevel: "Medium",
      avgAnnualReturn: "8–12% (including rental income)",
      timeHorizon: "10+ years",
      description: "Real estate investment means buying property to earn rental income or capital appreciation. REITs (Real Estate Investment Trusts) let you invest in real estate like a stock — no landlord responsibilities.",
      pros: ["Physical, tangible asset", "Rental income provides consistent cash flow", "Tax advantages via depreciation deductions", "Hedge against inflation — rents and values rise over time", "Leverage: control $300k of property with $60k down"],
      cons: ["Illiquid — hard to sell quickly", "Requires significant upfront capital", "Being a landlord is active work", "Property values can fall (see: 2008 housing crisis)"],
      begTip: "You don't need to own physical property. REITs like VNQ trade on the stock market and pay high dividends — great for passive real estate exposure.",
      famousRule: "The 1% rule: a rental property should generate monthly rent of at least 1% of its purchase price. A $200,000 home should rent for $2,000/month to be a solid investment."
    },
    retirement401k: {
      name: "401(k) Plans",
      riskLevel: "Varies by fund selection",
      avgAnnualReturn: "7–10% (same as underlying funds)",
      timeHorizon: "Until retirement (age 59½+)",
      description: "A 401(k) is an employer-sponsored retirement account. Contributions come out of your paycheck pre-tax, reducing your taxable income today. The money grows tax-deferred. Many employers match your contributions — this is free money you should never leave behind.",
      pros: ["Contributions reduce your taxable income now", "Employer match is an instant 50–100% return on matched amount", "Tax-deferred growth compounds faster", "2024 contribution limit: $23,000/yr (under 50), $30,500 (50+)"],
      cons: ["Money locked until 59½ (10% penalty for early withdrawal)", "Limited fund choices vs. a brokerage account", "Required Minimum Distributions start at age 73"],
      begTip: "Step 1: always contribute enough to get your full employer match. If your employer matches 4%, put in at least 4% — otherwise you're leaving free money on the table. Step 2: max out a Roth IRA. Step 3: max out your 401(k).",
      famousRule: "Investment priority order: (1) 401k to get full employer match, (2) pay off high-interest debt, (3) max Roth IRA, (4) max 401k, (5) taxable brokerage account."
    },
    rothIRA: {
      name: "Roth IRA",
      riskLevel: "Varies by fund selection",
      avgAnnualReturn: "7–10%",
      timeHorizon: "Until retirement",
      description: "A Roth IRA is funded with after-tax dollars, but all growth and withdrawals in retirement are completely tax-free. $7,000/year invested from age 22 to 65 at 7% grows to ~$1.4 million — and you owe $0 in taxes on it.",
      pros: ["Tax-FREE growth and withdrawals — the single biggest advantage in investing", "No Required Minimum Distributions", "Contributions (not earnings) can be withdrawn anytime penalty-free", "More investment choices than a 401(k)", "2024 limit: $7,000/year under 50"],
      cons: ["Income limits: phases out above $146k single / $230k married (2024)", "No upfront tax deduction like a Traditional IRA or 401k", "Lower contribution limit than 401k"],
      begTip: "If you're young and in a lower tax bracket, the Roth IRA is almost always the better choice over a Traditional IRA. Pay a small tax now, get massive tax-free growth for decades.",
      famousRule: "A single $7,000 contribution at age 22, left untouched until 65 at 10% annual return, becomes ~$400,000 — completely tax free. That is the Roth IRA's superpower."
    },
    emergencyFund: {
      name: "Emergency Fund (High-Yield Savings)",
      riskLevel: "None",
      avgAnnualReturn: "4–5% (current HYSA rates)",
      timeHorizon: "Liquid — access anytime",
      description: "An emergency fund is 3–6 months of living expenses kept in a High-Yield Savings Account (HYSA). It is not an investment — it is insurance. It prevents you from going into debt or selling investments at a loss when unexpected expenses arise.",
      pros: ["FDIC insured up to $250,000 — zero risk of loss", "Liquid — access within 1 business day", "Current rates ~4–5% APY (far better than traditional savings)", "Prevents debt spiral from unexpected emergencies"],
      cons: ["Returns do not beat inflation long-term", "Money could theoretically earn more invested in stocks"],
      begTip: "Best HYSAs: Marcus by Goldman Sachs, Ally Bank, SoFi, and Discover — all offering 4–5% APY with no minimum balance. Never keep your emergency fund in a traditional bank paying 0.01%.",
      famousRule: "Build your emergency fund before investing (except for your 401k employer match). Without it, one unexpected expense forces you to go into debt or sell investments at a bad time."
    },
    crypto: {
      name: "Cryptocurrency",
      riskLevel: "Very High",
      avgAnnualReturn: "Highly variable — Bitcoin averaged ~60%/yr 2011–2021, but with extreme crashes",
      timeHorizon: "Speculative — no guaranteed horizon",
      description: "Cryptocurrency is a digital asset using cryptography on decentralized networks (blockchains). Unlike stocks or bonds, crypto has no underlying earnings or cash flows — its value is driven by supply, demand, and market sentiment.",
      pros: ["Potential for extraordinary gains", "Decentralized — not controlled by any government", "Bitcoin's fixed 21 million coin supply is a potential inflation hedge", "24/7 trading"],
      cons: ["Extreme volatility: Bitcoin has dropped 80%+ multiple times", "No intrinsic value or cash flows to anchor pricing", "Regulatory risk remains significant", "Scams and fraud are widespread", "Most altcoins eventually go to zero"],
      begTip: "If you invest: limit crypto to 5% or less of your total portfolio. Stick to Bitcoin and Ethereum — the two most established. Never invest money you cannot afford to lose entirely.",
      famousRule: "Only invest what you can afford to lose completely. If you cannot sleep at night because of your crypto holdings, you own too much."
    }
  },

  taxOptimization: {
    capitalGains: "Assets held over 1 year are taxed at long-term capital gains rates (0%, 15%, or 20%) — much lower than ordinary income tax rates of up to 37%. This is why buy-and-hold investing is so tax-efficient.",
    taxLossHarvesting: "If an investment drops below what you paid, you can sell it to 'harvest' the loss, offsetting gains elsewhere and reducing your tax bill. You can then immediately reinvest in a similar (not identical) fund.",
    backdoorRoth: "If you earn too much for a Roth IRA, you can use the 'backdoor Roth' strategy: contribute to a Traditional IRA (no income limit) and then convert it to Roth. Legal and widely used by high earners.",
    hsa: "A Health Savings Account (HSA) has a triple tax benefit: contributions are pre-tax, growth is tax-free, and withdrawals for medical expenses are tax-free. After 65, it works like a traditional IRA for any expense."
  },

  debtPriority: {
    avalanche: "Mathematically optimal: pay minimums on all debts, then put every extra dollar toward the highest interest rate debt first. Saves the most money.",
    snowball: "Dave Ramsey's popular method: pay off the smallest balance first regardless of interest rate. Less efficient mathematically but psychologically motivating.",
    rule: "Any debt above 6–7% interest should generally be paid before investing (except enough to get your 401k employer match). Debt at 4% or below can be carried while investing, since long-term market returns (~7%) exceed the interest cost."
  },

  compoundInterest: {
    explanation: "Compound interest means you earn returns not just on your original investment, but on all previous returns too. The growth is exponential — it accelerates dramatically over decades.",
    rule72: "The Rule of 72: divide 72 by your annual return rate to find how many years to double your money. At 7%: 72 ÷ 7 = ~10.3 years. At 10%: 7.2 years.",
    example: "$10,000 invested at 7% for 40 years = $149,745. The same $10,000 in cash for 40 years = $10,000. That gap is the cost of waiting."
  }
};

// ─── Receipt Reader ───────────────────────────────────────────────────────────

async function readReceipt() {
  const fileInput = document.getElementById('fileElem')?.files?.[0];
  if (!fileInput) {
    alert('Please select a receipt file first.');
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput);
  formData.append('ipAddress', '34.2.2.223');

  const options = {
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': '7b5c35700bmshd533e544cf0dfc6p1698c2jsn227e77beeb4d',
      'X-RapidAPI-Host': 'taggun.p.rapidapi.com'
    },
    body: formData
  };

  try {
    const response = await fetch(TAGGUN_URL, options);
    const result = await response.json();
    const total = result?.totalAmount?.amount ?? 0;

    receiptTotals.push(total);
    const grandTotal = receiptTotals.reduce((sum, val) => sum + val, 0);

    const totalOpt = document.getElementById('total-opt');
    if (totalOpt) totalOpt.innerText = grandTotal.toFixed(2);

    let totalExpenditureLine = document.getElementById('total-expenditure');
    if (!totalExpenditureLine) {
      totalExpenditureLine = document.createElement('p');
      totalExpenditureLine.id = 'total-expenditure';
      document.body.appendChild(totalExpenditureLine);
    }
    totalExpenditureLine.innerText =
      `Receipt added: $${Number(total).toFixed(2)} — Total receipts: $${grandTotal.toFixed(2)}`;

    document.getElementById('fileElem').value = '';
    return grandTotal;
  } catch (error) {
    console.error('Receipt read error:', error);
    alert('Failed to read receipt. Please try again.');
  }
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function openCity(cityName, elmnt, color) {
  for (const tab of document.getElementsByClassName('tabcontent')) {
    tab.style.display = 'none';
  }
  for (const link of document.getElementsByClassName('tablink')) {
    link.style.backgroundColor = '';
  }
  const target = document.getElementById(cityName);
  if (target) target.style.display = 'block';
  elmnt.style.backgroundColor = color;
}

function toggleDropdown() {
  document.getElementById('myDropdown')?.classList.toggle('active');
}

// ─── Finance Calculator ───────────────────────────────────────────────────────

function calculate() {
  const income = parseFloat(document.getElementById('income').value);

  if (isNaN(income) || income < 0) {
    alert('Please enter a valid income amount.');
    return;
  }

  const totalExpenses = calculateTotalExpenses();
  const remainingMoney = income - totalExpenses;

  // Allocations based on remaining money after expenses:
  // 10% Financial Security, 15% 401(k), 20% Investment Budget
  const financialSecurity = remainingMoney * 0.10;
  const fourOhOneK        = remainingMoney * 0.15;
  const investAlloc       = remainingMoney * 0.20;

  const resultEl = document.getElementById('result');
  if (resultEl) {
    resultEl.innerHTML =
      `<strong>Gross Income: $${income.toFixed(2)}</strong><br>` +
      `Total Expenses Logged: $${totalExpenses.toFixed(2)}`;
  }

  const remainingEl = document.getElementById('remaining-money');
  if (remainingEl) {
    const color = remainingMoney >= 0 ? '#ffffff' : '#e74c3c';
    remainingEl.innerHTML =
      `<span style="color:${color}; font-weight:bold;">Remaining After Expenses: $${remainingMoney.toFixed(2)}</span>` +
      (remainingMoney < 0 ? ' ⚠️ You are spending more than you earn.' : '');
  }

  // Financial Security — 10%
  const savingsEl = document.getElementById('savings-box');
  if (savingsEl) savingsEl.innerHTML =
    `<strong>$${financialSecurity.toFixed(2)}/mo → Financial Security (10%)</strong><br>`;

  // 401(k) — 15%
  const fourkEl = document.getElementById('fourk-box');
  if (fourkEl) fourkEl.innerHTML =
    `<strong>$${fourOhOneK.toFixed(2)}/mo → 401(k) Plan (15%)</strong><br>`;

  // Investment Budget — 20%
  const investEl = document.getElementById('investment-box');
  if (investEl) investEl.innerHTML =
    `<strong>$${investAlloc.toFixed(2)}/mo → Investment Budget (20%)</strong><br>`;
}

function projectGrowth(monthlyContribution, annualRate, years) {
  let portfolio = 0;
  const monthlyRate = annualRate / 12;
  for (let i = 0; i < years * 12; i++) {
    portfolio = portfolio * (1 + monthlyRate) + monthlyContribution;
  }
  return `$${Math.round(portfolio).toLocaleString()}`;
}

function calculateTotalExpenses() {
  const expenseList = document.getElementById('historyList').getElementsByTagName('li');
  let totalExpenses = 0;
  for (const item of expenseList) {
    const match = item.textContent.match(/\$([0-9]+\.[0-9]+)/);
    if (match) totalExpenses += parseFloat(match[1]);
  }
  const receiptSum = receiptTotals.reduce((sum, val) => sum + val, 0);
  return totalExpenses + receiptSum;
}

function addExpense() {
  const ename = document.getElementById('ename').value.trim();
  const enumber = parseFloat(document.getElementById('enumber').value);

  if (!ename) { alert('Please enter an expense name.'); return; }
  if (isNaN(enumber) || enumber < 0) { alert('Please enter a valid amount.'); return; }

  displayExpense(`${ename}: $${enumber.toFixed(2)}`);
  calculate();

  document.getElementById('ename').value = '';
  document.getElementById('enumber').value = '';
}

function displayExpense(message) {
  const listItem = document.createElement('li');
  listItem.textContent = message;
  document.getElementById('historyList').appendChild(listItem);
}

// ─── Investment Info Card (call from HTML buttons if desired) ─────────────────

function showInvestmentInfo(type, targetElementId) {
  const info = FINANCE_KNOWLEDGE.investmentTypes[type];
  const el = document.getElementById(targetElementId);
  if (!info || !el) return;

  const riskColor = {
    'None': '#2ecc71', 'Low–Medium': '#27ae60', 'Medium': '#f39c12',
    'Medium–High': '#e67e22', 'Very High': '#e74c3c',
    'Varies by fund selection': '#3498db', 'Varies by fund selection': '#3498db'
  }[info.riskLevel] || '#888';

  el.innerHTML = `
    <div style="border-left:4px solid ${riskColor}; padding:12px; margin:10px 0; background:rgba(0,0,0,0.03); border-radius:4px;">
      <h3 style="margin:0 0 6px">${info.name}</h3>
      <p><strong>Risk:</strong> <span style="color:${riskColor}">${info.riskLevel}</span>
         &nbsp;|&nbsp; <strong>Avg Return:</strong> ${info.avgAnnualReturn}
         &nbsp;|&nbsp; <strong>Time Horizon:</strong> ${info.timeHorizon}</p>
      <p>${info.description}</p>
      <p><strong>✅ Pros:</strong> ${info.pros.join(' · ')}</p>
      <p><strong>⚠️ Cons:</strong> ${info.cons.join(' · ')}</p>
      <p><strong>💡 Beginner Tip:</strong> ${info.begTip}</p>
      <p style="font-style:italic;color:#555"><strong>📖 Famous Rule:</strong> ${info.famousRule}</p>
    </div>
  `;
}

// ─── Investment Graph ─────────────────────────────────────────────────────────

function generateGraph() {
  const age = parseInt(document.getElementById('ageInput').value);
  const incomeInput = parseFloat(document.getElementById('income').value);

  if (isNaN(age) || age < 0 || age > 100) {
    alert('Please enter a valid age (0–100).');
    return;
  }

  const monthlyIncome = (!isNaN(incomeInput) && incomeInput > 0) ? incomeInput / 12 : 1000;
  const years = Math.max(1, 65 - age);
  const labels = Array.from({ length: years + 1 }, (_, i) => age + i);

  const conservative = calcGrowthData(monthlyIncome, 0.10, 0.04, years);
  const moderate     = calcGrowthData(monthlyIncome, 0.10, 0.07, years);
  const aggressive   = calcGrowthData(monthlyIncome, 0.10, 0.10, years);

  const ctx = document.getElementById('investmentChart').getContext('2d');
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Conservative (4% — bonds/HYSA)',
          data: conservative,
          borderColor: '#27ae60',
          backgroundColor: 'rgba(39,174,96,0.05)',
          fill: true, tension: 0.3
        },
        {
          label: 'Moderate (7% — balanced index funds)',
          data: moderate,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52,152,219,0.08)',
          fill: true, tension: 0.3
        },
        {
          label: 'Aggressive (10% — 100% equities)',
          data: aggressive,
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231,76,60,0.05)',
          fill: true, tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString()}`
          }
        },
        legend: { position: 'bottom' }
      },
      scales: {
        x: { title: { display: true, text: 'Age' } },
        y: {
          min: 0,
          title: { display: true, text: 'Portfolio Value ($)' },
          ticks: { callback: (val) => `$${Number(val).toLocaleString()}` }
        }
      }
    }
  });

  // Summary paragraph below chart
  const finalModerate = moderate[moderate.length - 1];
  const contribution = Math.round(monthlyIncome * 0.10 * years * 12).toLocaleString();

  let summaryEl = document.getElementById('graph-summary');
  if (!summaryEl) {
    summaryEl = document.createElement('p');
    summaryEl.id = 'graph-summary';
    document.getElementById('investmentChart').parentNode.appendChild(summaryEl);
  }
  summaryEl.innerHTML =
    `<small>Investing 10% of income monthly from age <strong>${age}</strong> to <strong>65</strong>. ` +
    `Total out-of-pocket contributions: ~<strong>$${contribution}</strong>. ` +
    `Moderate scenario projects <strong>$${finalModerate.toLocaleString()}</strong> by retirement. ` +
    `Rule of 72: at 7%, your money doubles every <strong>${(72 / 7).toFixed(1)} years</strong> — that's compound interest at work.</small>`;
}

function calcGrowthData(monthlyIncome, investmentPct, annualRate, years) {
  const data = [];
  let portfolio = 0;
  const monthlyContrib = monthlyIncome * investmentPct;
  const monthlyRate = annualRate / 12;
  for (let i = 0; i <= years; i++) {
    for (let m = 0; m < 12; m++) {
      portfolio = portfolio * (1 + monthlyRate) + monthlyContrib;
    }
    data.push(Math.round(portfolio));
  }
  return data;
}

// ─── Chatbot ──────────────────────────────────────────────────────────────────

const chatResponses = [
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'sup', 'yo'],
    reply: "Hey! Welcome to Smart Dime 💰 Ask me about budgeting, saving, investing, retirement accounts, debt payoff, taxes, or how to start building wealth."
  },
  {
    keywords: ['help', 'what can you do', 'what do you know', 'topics', 'ask you'],
    reply: "I can explain: the 50/30/20 budget rule, emergency funds, stocks, bonds, index funds, ETFs, real estate, 401k, Roth IRA, crypto, compound interest, debt payoff strategies (avalanche vs snowball), tax optimization, and the FIRE movement. Just ask about any of these!"
  },
  {
    keywords: ['budget', '50/30/20', '50 30 20', 'budgeting rule', 'zero based', 'pay yourself'],
    reply: `The 50/30/20 rule: 50% of after-tax income on needs (rent, food, utilities), 30% on wants (entertainment, dining), 20% on savings and investing. ${FINANCE_KNOWLEDGE.budgetingRules['50/30/20'].tip} Alternatively, the 'Pay Yourself First' method: automate your savings transfer on payday before spending anything.`
  },
  {
    keywords: ['emergency', 'emergency fund', 'rainy day', 'safety net', 'hysa', 'high yield'],
    reply: `${FINANCE_KNOWLEDGE.investmentTypes.emergencyFund.description} ${FINANCE_KNOWLEDGE.investmentTypes.emergencyFund.begTip} This is step one before any investing (except getting your 401k employer match).`
  },
  {
    keywords: ['stock', 'stocks', 'equities', 'share', 'shares', 'equity', 'pick stocks'],
    reply: `${FINANCE_KNOWLEDGE.investmentTypes.stocks.description} Historical avg return: ${FINANCE_KNOWLEDGE.investmentTypes.stocks.avgAnnualReturn}. Risk: ${FINANCE_KNOWLEDGE.investmentTypes.stocks.riskLevel}. 💡 ${FINANCE_KNOWLEDGE.investmentTypes.stocks.begTip} Famous rule: ${FINANCE_KNOWLEDGE.investmentTypes.stocks.famousRule}`
  },
  {
    keywords: ['bond', 'bonds', 'treasury', 'fixed income', 't-bill', 'tbill'],
    reply: `${FINANCE_KNOWLEDGE.investmentTypes.bonds.description} Avg return: ${FINANCE_KNOWLEDGE.investmentTypes.bonds.avgAnnualReturn}. 💡 ${FINANCE_KNOWLEDGE.investmentTypes.bonds.begTip}`
  },
  {
    keywords: ['index fund', 'index funds', 'etf', 'etfs', 'voo', 'vanguard', 's&p', 'sp500', 's&p 500', '3 fund', 'three fund'],
    reply: `${FINANCE_KNOWLEDGE.investmentTypes.indexFunds.description} 💡 ${FINANCE_KNOWLEDGE.investmentTypes.indexFunds.begTip} Famous rule: ${FINANCE_KNOWLEDGE.investmentTypes.indexFunds.famousRule}`
  },
  {
    keywords: ['real estate', 'property', 'reit', 'rental', 'landlord', 'house', 'housing', 'mortgage'],
    reply: `${FINANCE_KNOWLEDGE.investmentTypes.realEstate.description} Avg return: ${FINANCE_KNOWLEDGE.investmentTypes.realEstate.avgAnnualReturn}. 💡 ${FINANCE_KNOWLEDGE.investmentTypes.realEstate.begTip} Famous rule: ${FINANCE_KNOWLEDGE.investmentTypes.realEstate.famousRule}`
  },
  {
    keywords: ['401k', '401(k)', 'employer match', 'retirement account', 'retirement plan', 'traditional ira'],
    reply: `${FINANCE_KNOWLEDGE.investmentTypes.retirement401k.description} 💡 ${FINANCE_KNOWLEDGE.investmentTypes.retirement401k.begTip}`
  },
  {
    keywords: ['roth', 'roth ira', 'ira', 'individual retirement', 'backdoor roth'],
    reply: `${FINANCE_KNOWLEDGE.investmentTypes.rothIRA.description} 💡 ${FINANCE_KNOWLEDGE.investmentTypes.rothIRA.begTip} ${FINANCE_KNOWLEDGE.investmentTypes.rothIRA.famousRule} Backdoor Roth: ${FINANCE_KNOWLEDGE.taxOptimization.backdoorRoth}`
  },
  {
    keywords: ['crypto', 'bitcoin', 'ethereum', 'cryptocurrency', 'btc', 'eth', 'blockchain', 'altcoin'],
    reply: `${FINANCE_KNOWLEDGE.investmentTypes.crypto.description} Risk level: Very High. 💡 ${FINANCE_KNOWLEDGE.investmentTypes.crypto.begTip}`
  },
  {
    keywords: ['compound', 'compound interest', 'compounding', 'rule of 72', 'double my money', 'exponential'],
    reply: `${FINANCE_KNOWLEDGE.compoundInterest.explanation} ${FINANCE_KNOWLEDGE.compoundInterest.rule72} Real example: ${FINANCE_KNOWLEDGE.compoundInterest.example}`
  },
  {
    keywords: ['debt', 'pay off debt', 'credit card', 'loan', 'avalanche', 'snowball', 'interest rate', 'student loan'],
    reply: `Two strategies: Avalanche — pay the highest interest rate debt first. Saves the most money mathematically. Snowball — pay the smallest balance first for psychological motivation. Key rule: ${FINANCE_KNOWLEDGE.debtPriority.rule}`
  },
  {
    keywords: ['tax', 'taxes', 'capital gains', 'tax loss', 'harvesting', 'hsa', 'health savings'],
    reply: `Key tax moves: (1) Long-term capital gains — ${FINANCE_KNOWLEDGE.taxOptimization.capitalGains} (2) Tax-loss harvesting — ${FINANCE_KNOWLEDGE.taxOptimization.taxLossHarvesting} (3) HSA — ${FINANCE_KNOWLEDGE.taxOptimization.hsa}`
  },
  {
    keywords: ['save', 'saving', 'savings rate', 'how much to save', 'how much should i save'],
    reply: "Standard advice: save at least 20% of income. The FIRE community shows that saving 50%+ can lead to retirement in 10–17 years instead of 40. Every extra 1% saved meaningfully shortens your timeline to financial independence. Even starting with $50/month matters enormously over time due to compounding."
  },
  {
    keywords: ['inflation', 'purchasing power', 'cost of living', 'money losing value'],
    reply: "Inflation averages ~3%/year historically. Cash loses half its purchasing power every 24 years at that rate. This is why investing is not optional for long-term wealth — keeping money in a 0.01% savings account guarantees you fall behind. A 4–5% HYSA barely keeps up with inflation; real growth comes from equity investing."
  },
  {
    keywords: ['diversif', 'diversification', 'diversify', 'spread risk', 'dont put eggs in one basket'],
    reply: "Diversification means spreading investments across asset classes, sectors, and geographies so one failure doesn't destroy your portfolio. A simple 3-fund portfolio achieves this: (1) US total market index, (2) International index, (3) Bond index. Historically, diversified portfolios have similar returns to concentrated ones but with dramatically lower volatility."
  },
  {
    keywords: ['start investing', 'how to invest', 'beginner', 'first investment', 'where to start', 'new to investing', 'just starting'],
    reply: "Beginner roadmap: (1) Build a $1,000 starter emergency fund. (2) Pay off any debt above 7% interest. (3) Contribute to 401k up to your employer match. (4) Open a Roth IRA and invest in a target-date fund or VOO. (5) Grow emergency fund to 3–6 months of expenses. (6) Max your 401k ($23k/yr). (7) Open a taxable brokerage account for anything extra."
  },
  {
    keywords: ['net worth', 'wealth', 'assets', 'liabilities', 'balance sheet', 'how rich'],
    reply: "Net worth = Total Assets − Total Liabilities. Assets: cash, investments, real estate equity, car value. Liabilities: mortgage balance, student loans, car loans, credit card debt. Tracking your net worth monthly is more meaningful than tracking income — income is how much you earn, net worth is how much you actually keep and grow."
  },
  {
    keywords: ['fire', 'financial independence', 'retire early', 'financial freedom', 'passive income', '4% rule'],
    reply: "FIRE = Financial Independence, Retire Early. The math: you need 25x your annual expenses invested to retire (the '4% rule' — withdraw 4%/year without running out over 30 years). Spend $40,000/year? You need $1,000,000. Spend $60,000? You need $1,500,000. The faster you increase your savings rate, the sooner you reach your number."
  },
  {
    keywords: ['dollar cost', 'dca', 'dollar cost averaging', 'lump sum', 'timing the market'],
    reply: "Dollar-Cost Averaging (DCA): invest a fixed amount at regular intervals regardless of price. When prices are high you buy fewer shares; when prices are low you buy more. Studies show DCA and lump-sum investing produce similar returns over long periods, but DCA reduces the risk of bad timing and removes emotional decision-making from the equation."
  },
  {
    keywords: ['recession', 'market crash', 'bear market', 'stock market crash', 'what to do when market drops'],
    reply: "In a market crash: (1) Do NOT sell — selling locks in losses. (2) Keep investing — you're buying at a discount. (3) Check your emergency fund is intact. (4) Rebalance if stocks have dropped well below your target allocation. History shows the market has recovered from every crash, including 1929, 2008, and 2020. Time in the market beats timing the market."
  },
  {
    keywords: ['fact', 'history', 'did you know', 'fun fact'],
    reply: "Financial fact: The S&P 500 has returned positive results in about 75% of all calendar years since 1928. The average bull market lasts ~6.6 years; the average bear market lasts ~1.3 years. Long-term investors who simply stayed invested through every downturn came out significantly ahead of those who tried to time the market."
  },
  {
    keywords: ['real', 'true', 'prove', 'is that true', 'really'],
    reply: "Yes — everything I share is based on established personal finance principles and historical market data. Of course, past returns don't guarantee future results, and everyone's situation is different. Always consider consulting a licensed financial advisor (CFP) for personalized advice."
  },
  {
    keywords: ['name'],
    reply: "That's a great name! Now, what can I help you with financially? 😄"
  },
  // Fallback — always last
  {
    keywords: [],
    reply: "I'm not sure about that one! Try asking about: budgeting, emergency funds, stocks, bonds, index funds, ETFs, 401k, Roth IRA, real estate, crypto, compound interest, debt payoff, taxes, inflation, or how to start investing."
  }
];

function submitResponse() {
  const userResponseInput = document.getElementById('user-response');
  const userResponse = userResponseInput.value.trim();
  if (!userResponse) return;

  chat(userResponse, 'You');
  userResponseInput.value = '';

  const lower = userResponse.toLowerCase();
  const match = chatResponses.find(({ keywords }) =>
    keywords.length > 0 && keywords.some(kw => lower.includes(kw))
  );

  const reply = match ? match.reply : chatResponses[chatResponses.length - 1].reply;
  setTimeout(() => chat(reply, 'SmartDime'), 400);
}

function chat(message, type) {
  const output = document.getElementById('terminal-output');
  if (output) {
    output.innerHTML += `<br><strong>${type}:</strong> ${message}`;
    output.scrollTop = output.scrollHeight;
  }
}

function toggleChat() {
  const chatContainer = document.getElementById('chat-container');
  if (chatContainer) {
    chatContainer.style.display =
      chatContainer.style.display === 'none' ? 'block' : 'none';
  }
}

// ─── Age Listener ─────────────────────────────────────────────────────────────

function initAgeListener() {
  const ageInput = document.getElementById('age');
  const terminalOutput = document.getElementById('terminal-output');
  if (ageInput && terminalOutput) {
    ageInput.addEventListener('change', function () {
      terminalOutput.innerHTML += `<br>Age set to ${this.value}.`;
    });
  }
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

function initFAQ() {
  for (const item of document.getElementsByClassName('faqQuestion')) {
    item.addEventListener('click', function () {
      this.classList.toggle('active');
      const body = this.nextElementSibling;
      if (body) body.style.display = body.style.display === 'block' ? 'none' : 'block';
    });
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const defaultOpen = document.getElementById('defaultOpen');
  if (defaultOpen) defaultOpen.click();

  initFAQ();
  initAgeListener();

  chat(
    "Hello! Welcome to Smart Dime 💰 I'm your financial advisor. Ask me about budgeting, investing, retirement accounts (401k/Roth IRA), debt payoff, taxes, or how to start building wealth.",
    'SmartDime'
  );
});