const url = 'https://taggun.p.rapidapi.com/api/receipt/v1/simple/file';
// const data = new FormData();
// data.append('file', '170px-ReceiptSwiss.jpg');
// data.append('ipAddress', '34.2.2.223');

// const options = {
//   method: 'POST',
//   headers: {
//     'X-RapidAPI-Key': '7b5c35700bmshd533e544cf0dfc6p1698c2jsn227e77beeb4d',
//     'X-RapidAPI-Host': 'taggun.p.rapidapi.com'
//   },
//  // body: data
// };

var totalNumber = 0;


function toggleDropdown() {
  var dropdown = document.getElementById("myDropdown");
  dropdown.classList.toggle("active");
}

async function readReceipt() {
  console.log("hello world");
  const formData = new FormData();
  const fileInput = document.getElementById('fileElem')?.files?.[0];

  console.log(fileInput);

  if (fileInput) {
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
      const response = await fetch(url, options);
      const result = await response.text();
      console.log(result);
      alert(result);

      var total = '';
      for (var i = 23; i <= 26; i++) {
        total += result[i];
      }
      totalNumber += Number(total);
      document.getElementById('total-opt').innerText = totalNumber.toFixed(2);

      var resultMessage = `Expenditure added: $${total.toFixed(2)},
        Total amount: $${totalNumber.toFixed(2)}`;
      console.log(resultMessage);

     
      var totalExpenditureLine = document.getElementById('total-expenditure');
      if (!totalExpenditureLine) {
        totalExpenditureLine = document.createElement('p');
        totalExpenditureLine.id = 'total-expenditure';
        document.body.appendChild(totalExpenditureLine);
      }
      totalExpenditureLine.innerText = resultMessage;

      // Clear the file input value after successful operation
      document.getElementById('fileElem').value = '';

      return totalNumber;
    } catch (error) {
      console.error(error);
    }
  }
}



function openCity(cityName, elmnt, color) {
 
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
  }

 
  document.getElementById(cityName).style.display = "block";

  
  elmnt.style.backgroundColor = color;
}


document.getElementById("defaultOpen").click();
var faq = document.getElementsByClassName("faqQuestion");
var i;
for (i = 0; i < faq.length; i++) {
    faq[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var body = this.nextElementSibling;
        if (body.style.display === "block") {
            body.style.display = "none";
        } else {
            body.style.display = "block";
        }
    });
}


function calculate() {
    var income = parseFloat(document.getElementById('income').value);
   var age = parseInt(document.getElementById('ageInput').value);

    if (isNaN(income)) {
        alert('Please enter valid numbers for income and age.');
        return;
    }

  
    var savings = income * 0.1; 
    var fourK = income * 0.04;
    var investment = income * 0.15;

    // Calculate total income and expenses
    var totalIncome = income;
    var totalExpenses = calculateTotalExpenses();

    // Calculate remaining money after subtracting expenses
    var remainingMoney = totalIncome - totalExpenses;
  var resultMessage = `Your Gross income is $${totalIncome.toFixed(2)},now let's calcaluate the deductions:`;



  



  
    document.getElementById('remaining-money').innerText = `Remaining Money: $${remainingMoney.toFixed(2)}`;
  document.getElementById('result').innerText = resultMessage;

  var savingsMessage = `$${(remainingMoney * 0.1).toFixed(2)} for financial security`;
  var fourKMessage = `$${(remainingMoney * 0.04).toFixed(2)} for 401k Plan`;
  var investmentMessage = `$${(remainingMoney * 0.15).toFixed(2)} for investment budget`;

  document.getElementById('savings-box').innerText = savingsMessage;
  document.getElementById('fourk-box').innerText = fourKMessage;
  document.getElementById('investment-box').innerText = investmentMessage;
}

function calculateTotalExpenses() {
    var expenseList = document.getElementById('historyList').getElementsByTagName('li');
    var totalExpenses = 0;

    for (var i = 0; i < expenseList.length; i++) {
        var expenseText = expenseList[i].textContent;
        var expenseAmount = parseFloat(expenseText.match(/\d+\.\d+/)[0]);
        totalExpenses += expenseAmount + totalNumber;
    }

    return totalExpenses;
}

function addExpense() {
    var ename = document.getElementById('ename').value;
    var enumber = parseFloat(document.getElementById('enumber').value);

    // Checking if enumber is a valid number
    if (isNaN(enumber)) {
        alert('Please enter a valid number for expenditure amount.');
        return;
    }

    var resultMessage = `Added expenditure ${ename} with amount $${enumber.toFixed(2)}, 
    `;
    displayExpense(resultMessage);

    // Recalculate total expenses and remaining money
    calculate();

    // Clearing the textboxes
    document.getElementById('ename').value = '';
    document.getElementById('enumber').value = '';
}

function displayExpense(message) {
    var historyList = document.getElementById('historyList');
    var listItem = document.createElement('li');
    listItem.textContent = message;
    historyList.appendChild(listItem);
}
let ageInput = document.getElementById("age");
let userResponseInput = document.getElementById("user-response");
let terminalOutput = document.getElementById("terminal-output");

ageInput.addEventListener("change", function() {
    let age = ageInput.value;
    terminalOutput.innerHTML = `Age set to ${age}.`;

   
});


function generateGraph() {
  var age = parseInt(document.getElementById('ageInput').value);
  if (isNaN(age) || age < 0) {
    alert('Please enter a valid age.');
    return;
  }

  var monthlyIncome = 1000; 
  var investmentPercentage = 0.1; // 10% of monthly income
  var years = 30; // Number of years for the investment to grow

  var data = {
    labels: Array.from({ length: years + 1 }, (_, i) => i + age),
    datasets: [{
      label: 'Investment Growth',
      data: calculateInvestmentGrowth(age, monthlyIncome, investmentPercentage, years),
      fill: false,
      borderColor: 'blue',
    }],
  };

  var ctx = document.getElementById('investmentChart').getContext('2d');
  var myChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
        },
        y: {
          min: 0,
        },
      },
    },
  });
}

function calculateInvestmentGrowth(age, monthlyIncome, investmentPercentage, years) {
  var data = [];
  var initialInvestment = 0;

  for (var i = 0; i <= years; i++) {
    initialInvestment += monthlyIncome * 12 * investmentPercentage;
    data.push(initialInvestment);
  }

  return data;
}

function chat(message, type) {
  document.getElementById("terminal-output").innerHTML += `<br><strong>${type}:</strong> ${message}`;
}

function submitResponse() {
  let userResponse = document.getElementById("user-response").value;
  chat(userResponse, 'User');
  document.getElementById("user-response").value = "";

 
  if (userResponse.toLowerCase().includes("fin")) {
      chat("Yes Of course, you may use our finaitial calcaluator?", 'Chatbot');
  } else if (userResponse.toLowerCase().includes("help")) {
      chat("Yes Of Course! I'm here to assist you. Please enter your Income in our calcaluator", 'Chatbot');
  } else if (userResponse.toLowerCase().includes("real")) {
      chat("I agree about that, it is scientifically proven to be 100% true", 'Chatbot');
  } else if (userResponse.toLowerCase().includes("fact")) {
      chat("The first personal finance software dates back to the early 1980s when Quicken was introduced, revolutionizing how individuals managed their finances on personal computers", 'Chatbot');
  } else if (userResponse.toLowerCase().includes("name")) {
      chat("Thats a really pretty name", 'Chatbot');
  } else if (userResponse.toLowerCase().includes("Budget")) {
      chat("Go to our finincial calcaluator", 'Chatbot');
    } else if (userResponse.toLowerCase().includes("advice")) {
      chat("Maximize contributions to retirement accounts like 401(k)s and IRAs to take advantage of tax benefits", 'Chatbot');
    } else if (userResponse.toLowerCase().includes("another")) {
      chat("Don't put all your eggs in one basket. Diversify your investment portfolio to spread risk", 'Chatbot');
  } else {
      chat("I'm sorry, I didn't understand. Can you please provide more details?", 'Chatbot');
  }
}

function toggleChat() {
  var chatContainer = document.getElementById("chat-container");
  chatContainer.style.display = (chatContainer.style.display === 'none') ? 'block' : 'none';
}

chat("Hello! Welcome to Smart Dime. I am an AI Finincial Advisor, How may I assist you today?", 'Chatbot');



