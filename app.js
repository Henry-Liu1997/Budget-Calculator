// BUDGET CONTROLLER
var budgetController = (function () {
  var Income = function (id, desc, value) {
    (this.id = id),
      (this.desc = desc),
      (this.value = value),
      (this.percentage = -1);
  };

  var Expense = function (id, desc, value) {
    (this.id = id), (this.desc = desc), (this.value = value);
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var calculateTotal = function (type) {
    var sum = 0;

    data.allItems[type].forEach(function (current) {
      sum += current.value;
    });

    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };
  return {
    addItem: function (type, desc, value) {
      var newItem, ID;

      //Create new ID
      if (data.allItems[type].length === 0) {
        ID = 0;
      } else {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }

      //Create new item
      if (type === "exp") {
        newItem = new Expense(ID, desc, value);
      } else if (type === "inc") {
        newItem = new Income(ID, desc, value);
      }

      //Push item into our data structure
      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function (type, ID) {
      data.allItems[type] = data.allItems[type].filter(
        (item) => item.id !== ID
      );
    },

    testing: function () {
      console.log(data);
    },

    calculateBudget: function () {
      // calculate total income and expenses
      calculateTotal("inc");
      calculateTotal("exp");

      // calculate the budget
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (current) {
        current.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map((item) => item.getPercentage());
      return allPerc;
    },

    getBudget: function () {
      return {
        totalExp: data.totals.exp,
        totalInc: data.totals.inc,
        budget: data.budget,
        percentage: data.percentage,
      };
    },
  };
})();

// UI CONTROLLER
var UIController = (function () {
  var DOMstrings = {
    inputBtn: ".add__btn",
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budget: ".budget__value",
    income: ".budget__income--value",
    expenses: ".budget__expenses--value",
    percentage: ".budget__expenses--percentage",
    container: ".list",
    itemPercentage: ".item__percentage",
    titleDate: ".budget__title--month",
  };

  var formatNumber = function (num, type) {
    var numSplit, int, dec;
    num = Math.abs(num).toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];
    dec = numSplit[1];
    // 200,000.00;
    if (int.length > 3) {
      num =
        int.substring(0, int.length - 3) +
        "," +
        int.substring(int.length - 3) +
        "." +
        dec;
    }
    return type === "exp" ? "- " + num : "+ " + num;
  };
  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        desc: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },
    getDomstrings: function () {
      return DOMstrings;
    },
    addListItem: function (obj, type) {
      var html, newHTML, element;

      if (type === "inc") {
        html =
          '<div class="item clearfix" id="%type%"><div class="item__description">%descrption%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-trash-alt"></i></button></div></div></div>';
        element = DOMstrings.incomeContainer;
      } else if (type === "exp") {
        html =
          '<div class="item clearfix" id="%type%"><div class="item__description">%descrption%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-trash-alt"></i></button></div> </div> </div>';
        element = DOMstrings.expensesContainer;
      }

      newHTML = html.replace("%descrption%", obj.desc);
      newHTML = newHTML.replace("%type%", type + "-" + obj.id);
      newHTML = newHTML.replace("%value%", formatNumber(obj.value, type));
      document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);
    },
    clearFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );
      fieldsArr = Array.prototype.slice.call(fields);
      fields.forEach(function (current, index, array) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },

    deleteListItem: function (id) {
      document
        .getElementById(id)
        .parentNode.removeChild(document.getElementById(id));
    },

    displayBudget(obj) {
      var type;
      obj.budget >= 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMstrings.budget).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.income).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(DOMstrings.expenses).textContent = formatNumber(
        obj.totalExp,
        "exp"
      );

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentage).textContent =
          obj.percentage + " %";
      } else {
        document.querySelector(DOMstrings.percentage).textContent = "---";
      }
    },

    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DOMstrings.itemPercentage);

      fields.forEach(function (field, index) {
        if (percentages[index] > 0) {
          field.textContent = percentages[index] + "%";
        } else {
          field.textContent = "---";
        }
      });
    },
    displayDate() {
      var now, month, year, Month;
      now = new Date();
      month = now.getMonth();
      year = now.getFullYear();
      Month = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      document.querySelector(DOMstrings.titleDate).textContent =
        Month[month] + " " + year;
    },
    changeType() {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue +
          "," +
          DOMstrings.inputBtn
      );

      fields.forEach(function (field, index) {
        if (index < 3) {
          field.classList.toggle("red-focus");
        } else {
          field.classList.toggle("red");
        }
      });
    },
  };
})();

// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UIctrl) {
  var updateBudget = function () {
    // 1. Calculate budget
    budgetCtrl.calculateBudget();

    // 2. Return budget
    var budget = budgetCtrl.getBudget();

    // 3. Display the budget on the UI
    UIctrl.displayBudget(budget);
  };

  var updatePercentages = function () {
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();

    // 2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();

    // 3. Update the UI with the new Percentages
    UIctrl.displayPercentages(percentages);
  };
  var ctrlAddItem = function () {
    var input, newItem;

    // 1. Get the field input data
    input = UIctrl.getInput();
    if (input.desc !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.desc, input.value);

      // 3. Add the item to the UI
      UIctrl.addListItem(newItem, input.type);

      // 4. Clear the fields
      UIctrl.clearFields();

      // 5. Calculate and update budget
      updateBudget();

      // 6. Update percentage
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function (event) {
    var elementID, type, ID;
    elementID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (elementID) {
      type = elementID.split("-")[0];
      ID = parseInt(elementID.split("-")[1]);

      // 1.  Delete the item from the budget controller
      budgetCtrl.deleteItem(type, ID);

      // 2.  Delete the item from the UI
      UIctrl.deleteListItem(elementID);

      // 3. Update and show the new budgets
      updateBudget();

      // 4. Update percentage
      updatePercentages();
    }
  };

  //Set Up Event Listeners
  var setupEventListiners = function () {
    var DOM = UIctrl.getDomstrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UIctrl.changeType);
  };

  return {
    init: function () {
      console.log("Application has started"), setupEventListiners();
      UIctrl.displayBudget({
        totalExp: 0,
        totalInc: 0,
        budget: 0,
        percentage: -1,
      });
      UIctrl.displayDate();
    },
  };
})(budgetController, UIController);

controller.init();
