"use strict";

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [2_500, 457.77, -400, 30_000.678, -650, -13_500, 750.5, 1_300],
  locale: "pt-PT",
  movementsDates: [
    "2019-05-08T21:31:17.178Z",
    "2020-05-06T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2024-08-10T17:01:17.194Z",
    "2024-08-07T23:36:17.929Z",
    "2024-08-05T10:51:36.790Z",
  ],
  pin: 1111,
};

const account2 = {
  owner: "Jessica Davis",
  movements: [
    50_500, 34_00, -15_550, -790, -3_210.24, -1_000, 8_500.76, -3_500,
  ],
  locale: "de-DE",
  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-05-27T17:01:17.194Z",
    "2023-05-01T23:36:17.929Z",
    "2024-05-02T10:51:36.790Z",
  ],
  pin: 2222,
};

const accounts = [account1, account2];

const headerTxt = document.querySelector(".wlc-msg");
const userNameInput = document.querySelector(".input-user");
const container = document.querySelector(".section-container");
const pinInput = document.querySelector(".input-pin");
const datBalRefresh = document.querySelector(".date-bal");
const currentBalance = document.querySelector(".curr-bal");
const transactionContainer = document.querySelector(".transactions-div");
const accTransferTo = document.querySelector(".tf-input-to");
const amtTransfer = document.querySelector(".tf-input-amt");
const loanAmount = document.querySelector(".req-loan-input");
const loanPin = document.querySelector(".req-loan-input-pin");
const transferBtn = document.querySelector(".tf-btn");
const formSubmitBtn = document.querySelector(".nav-form-btn");
const loanBtn = document.querySelector(".req-loan-btn");
const dateLabel = document.querySelector(".date-bal");
// const locale = navigator.language;
let currentUser,
  bal,
  unpaidLoans = 0;

// Creating Username for each user
accounts.forEach((acc) => {
  acc.username = acc.owner
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toLowerCase();
});

function FormatDate(dateISO) {
  const date = new Date(dateISO);
  const options = {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  };
  const calcDaysPassed = (day1, day2) =>
    Math.round(Math.abs(day1 - day2) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  const formattedDate = new Intl.DateTimeFormat(
    currentUser.locale,
    options
  ).format(date);

  if (daysPassed === 0) return "TODAY";
  if (daysPassed === 1) return "YESTERDAY";
  if (daysPassed <= 7) return `${daysPassed} Days Ago`;
  else {
    return formattedDate;
  }
}

function displayMovementsAndCalcBal(user) {
  // Display Movements
  transactionContainer.innerHTML = "";
  const movs = user.movements;
  const formatInt = (int) =>
    new Intl.NumberFormat(currentUser.locale, {
      style: "currency",
      currency: "NGN",
    }).format(Math.abs(int));

  movs.forEach((cur, i) => {
    const movDirection = cur > 0 ? "deposit" : "withdrawal";
    const currMovDate = new Date(currentUser.movementsDates[i]);
    const date = FormatDate(currMovDate);

    const html = `<div class="flex trans-div"><div><span class="${movDirection}">${
      i + 1
    } ${movDirection}</span><span class="mov-date">${date}</span></div><span class="trans-amt">${formatInt(
      cur
    )}</span></div>`;
    transactionContainer.insertAdjacentHTML("afterbegin", html);
  });

  headerTxt.textContent = `Welcome back, ${currentUser.owner.split(" ")[0]}`;

  // Calc && display Balance
  bal = movs.reduce((acc, cur) => cur + acc, 0);
  currentBalance.textContent = `${formatInt(bal)}`;
}

// USER AUTH
formSubmitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const pin = pinInput.value;
  const user = userNameInput.value;
  const now = new Date();

  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    minute: "numeric",
    hour: "numeric",
    weekday: "long",
  };
  const accIndex = accounts.findIndex(
    (acc) => acc.username === user && acc.pin === +pin
  );

  // 'findIndex' returns -1 if the condition isnt met by any char in the array
  currentUser = accIndex < 0 ? "" : accounts[accIndex];

  if (accIndex >= 0) {
    container.style.opacity = 1;
    displayMovementsAndCalcBal(currentUser);
    dateLabel.textContent = new Intl.DateTimeFormat(
      currentUser.locale,
      options
    ).format(now);
  }
  pinInput.value = userNameInput.value = "";
});

// USER TRANSACTION
transferBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const amtToTransfer = +amtTransfer.value;
  const dateTf = new Date().toISOString();

  const acctTrfToIndex = accounts.findIndex(
    (acc) => acc.username === accTransferTo.value
  );

  if (
    amtToTransfer < bal &&
    acctTrfToIndex >= 0 &&
    accTransferTo.value !== currentUser.username
  ) {
    accounts[acctTrfToIndex].movements.push(Math.abs(amtToTransfer));
    currentUser.movements.push(-amtToTransfer);

    accounts[acctTrfToIndex].movementsDates.push(dateTf);
    currentUser.movementsDates.push(dateTf);
  }
  displayMovementsAndCalcBal(currentUser);
  amtTransfer.value = accTransferTo.value = "";
});

loanBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const inputtedPin = loanPin.value;
  const reqAmount = +loanAmount.value;
  const dateTf = new Date().toISOString();

  if (
    bal >= reqAmount * 0.75 &&
    currentUser.pin === +inputtedPin &&
    unpaidLoans < 5
  )
    setTimeout(() => {
      {
        unpaidLoans += 1;
        currentUser.movements.push(reqAmount);

        currentUser.movementsDates.push(dateTf);
      }

      displayMovementsAndCalcBal(currentUser);
    }, 3500);
  loanPin.value = loanAmount.value = "";
});

const clock = setInterval(() => {
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(new Date());
  console.log(time);
}, 1000);

setTimeout(() => clearInterval(clock), 5000);
