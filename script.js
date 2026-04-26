const TAGGUN_URL = 'https://taggun.p.rapidapi.com/api/receipt/v1/simple/file';

let receiptTotals = [];
let chartInstance = null;


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