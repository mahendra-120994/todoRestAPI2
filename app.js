const express = require("express");
const path = require("path");

const { format, parse } = require("date-fns");

const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Sever Running at http://localhost:3000/");
    });
  } catch (err) {
    console.log(`DB Error: ${err.massage}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// Get Todo with query API 1
app.get("/todos/", async (req, res) => {
  let data = null;
  let getTodosQuery = "";

  const { search_q = "", status, priority, category } = req.query;

  const isValidStatus = ["TO DO", "IN PROGRESS", "DONE"].includes(
    req.query.status
  );
  const isValidPriority = ["LOW", "MEDIUM", "HIGH"].includes(
    req.query.priority
  );
  const isValidCategory = ["HOME", "WORK", "LEARNING"].includes(
    req.query.category
  );

  const hasStatusProperty = (requestQuery) => {
    if (requestQuery.status !== undefined) {
      if (isValidStatus) {
        return true;
      } else {
        res.status(400);
        res.send("Invalid Todo Status");
      }
    } else {
      return false;
    }
  };

  const hasPriorityProperty = (requestQuery) => {
    if (requestQuery.priority !== undefined) {
      if (isValidPriority) {
        return true;
      } else {
        res.status(400);
        res.send("Invalid Todo Priority");
      }
    } else {
      return false;
    }
  };

  const hasCategoryProperty = (requestQuery) => {
    if (requestQuery.category !== undefined) {
      if (isValidCategory) {
        return true;
      } else {
        res.status(400);
        res.send("Invalid Todo Category");
      }
    } else {
      return false;
    }
  };

  const hasPriorityAndStatusProperties = (requestQuery) => {
    if (
      requestQuery.priority !== undefined &&
      requestQuery.status !== undefined
    ) {
      if ((isValidPriority === isValidStatus) === true) {
        return true;
      } else if (isValidPriority === false) {
        res.status(400);
        res.send("Invalid Todo Priority");
      } else if (isValidStatus === false) {
        res.status(400);
        res.send("Invalid Todo Status");
      }
    } else {
      return false;
    }
  };

  const hasCategoryAndStatusProperties = (requestQuery) => {
    if (
      requestQuery.category !== undefined &&
      requestQuery.status !== undefined
    ) {
      if ((isValidCategory === isValidStatus) === true) {
        return true;
      } else if (isValidCategory === false) {
        res.status(400);
        res.send("Invalid Todo Category");
      } else if (isValidStatus === false) {
        res.status(400);
        res.send("Invalid Todo Status");
      }
    } else {
      return false;
    }
  };

  const hasCategoryAndPriorityProperties = (requestQuery) => {
    if (
      requestQuery.category !== undefined &&
      requestQuery.priority !== undefined
    ) {
      if ((isValidCategory === isValidPriority) === true) {
        return true;
      } else if (isValidCategory === false) {
        res.status(400);
        res.send("Invalid Todo Category");
      } else if (isValidPriority === false) {
        res.status(400);
        res.send("Invalid Todo Priority");
      }
    } else {
      return false;
    }
  };

  const hasSearchQuery = (requestQuery) => {
    return requestQuery.search_q !== undefined;
  };

  switch (true) {
    case hasPriorityAndStatusProperties(req.query):
      getTodosQuery = `
   SELECT id,todo,priority,status,category, due_date as dueDate
   FROM todo
   WHERE todo LIKE '%${search_q}%'
    AND priority = '${priority}'
    AND status = '${status}';`;
      data = await db.all(getTodosQuery);
      res.send(data);
      break;

    case hasCategoryAndStatusProperties(req.query):
      getTodosQuery = `
   SELECT id,todo,priority,status,category, due_date as dueDate
   FROM todo
   WHERE todo LIKE '%${search_q}%'
    AND category = '${category}'
    AND status = '${status}';`;
      data = await db.all(getTodosQuery);
      res.send(data);
      break;

    case hasCategoryAndPriorityProperties(req.query):
      getTodosQuery = `
   SELECT id,todo,priority,status,category, due_date as dueDate
   FROM todo
   WHERE todo LIKE '%${search_q}%'
    AND category = '${category}'
    AND priority = '${priority}';`;
      data = await db.all(getTodosQuery);
      res.send(data);
      break;

    case hasStatusProperty(req.query):
      getTodosQuery = `
   SELECT id,todo,priority,status,category, due_date as dueDate
   FROM todo
   WHERE todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      data = await db.all(getTodosQuery);
      res.send(data);
      break;

    case hasPriorityProperty(req.query):
      getTodosQuery = `
   SELECT id,todo,priority,status,category, due_date as dueDate
   FROM todo
   WHERE todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      data = await db.all(getTodosQuery);
      res.send(data);
      break;

    case hasCategoryProperty(req.query):
      getTodosQuery = `
   SELECT id,todo,priority,status,category, due_date as dueDate
   FROM todo
   WHERE todo LIKE '%${search_q}%'
    AND category = '${category}';`;
      data = await db.all(getTodosQuery);
      res.send(data);
      break;

    case hasSearchQuery(req.query):
      getTodosQuery = `
       SELECT id,todo,priority,status,category, due_date as dueDate
       FROM todo
       WHERE todo LIKE '%${search_q}%';`;
      data = await db.all(getTodosQuery);
      res.send(data);
      break;
  }
});

// GET Todo by ID API 2
app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const getTodoQuery = `SELECT 
  id,todo,priority,status,category, due_date as dueDate
  FROM todo 
  WHERE id = ${todoId};`;
  const todo = await db.get(getTodoQuery);
  res.send(todo);
});

// GET agenda API 3
app.get("/agenda/", async (req, res) => {
  const { search_q = "", date } = req.query;

  try {
    const parseDate = await parse(date, "yyyy-MM-dd", new Date());
    const resultDate = await format(parseDate, "yyyy-MM-dd");

    const getTodoQuery = `SELECT 
    id,todo,priority,status,category, due_date as dueDate
    FROM todo 
    WHERE todo LIKE '%${search_q}%'
    AND due_date LIKE '${resultDate}' ;`;
    const todo = await db.get(getTodoQuery);
    res.send(todo);
  } catch {
    res.status(400);
    res.send("Invalid Due Date");
  }
});

// Add Todo API 4
app.post("/todos/", async (req, res) => {
  const { id, todo, priority, status, category, dueDate } = req.body;

  addNewTodo = async () => {
    try {
      const parseDate = await parse(dueDate, "yyyy-MM-dd", new Date());
      const resultDate = await format(parseDate, "yyyy-MM-dd");

      let addTodoQuery = `
            INSERT INTO
            todo ( id, todo, priority, status,category, due_date )
            VALUES
            (
                ${id},
                '${todo}',
                '${priority}',
                '${status}',
                '${category}',
                '${resultDate}'
            );`;
      await db.run(addTodoQuery);
      res.send("Todo Successfully Added");
    } catch {
      res.status(400);
      res.send("Invalid Due Date");
    }
  };

  const isValidStatus = ["TO DO", "IN PROGRESS", "DONE"].includes(status);
  const isValidPriority = ["LOW", "MEDIUM", "HIGH"].includes(priority);
  const isValidCategory = ["HOME", "WORK", "LEARNING"].includes(category);

  if (isValidStatus) {
    if (isValidPriority) {
      if (isValidCategory) {
        addNewTodo();
      } else {
        res.status(400);
        res.send("Invalid Todo Category");
      }
    } else {
      res.status(400);
      res.send("Invalid Todo Priority");
    }
  } else {
    res.status(400);
    res.send("Invalid Todo Status");
  }
});

// Update Todo API 5
app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;

  const reqBody = req.body;

  const prevTodoQuery = `
  SELECT
  *
  FROM todo
  WHERE id = ${todoId};`;

  const prevTodo = await db.get(prevTodoQuery);

  const {
    todo = prevTodo.todo,
    status = prevTodo.status,
    priority = prevTodo.priority,
    category = prevTodo.category,
    dueDate = prevTodo.due_date,
  } = req.body;

  let updateColumn = "";

  const updateQuery = async (updateColumn, dueDate) => {
    const updateTodoQuery = `
    UPDATE todo
    SET
        todo ='${todo}',
        status ='${status}',
        priority ='${priority}',
        category ='${category}',
        due_date ='${dueDate}'
    WHERE id = ${todoId};`;

    await db.run(updateTodoQuery);
    res.send(`${updateColumn} Updated`);
  };

  updateDueDate = async (updateColumn) => {
    try {
      const parseDate = await parse(dueDate, "yyyy-MM-dd", new Date());
      let resultDate = await format(parseDate, "yyyy-MM-dd");
      updateQuery(updateColumn, resultDate);
    } catch {
      res.status(400);
      res.send("Invalid Due Date");
    }
  };

  switch (true) {
    case reqBody.status !== undefined:
      const isValidStatus = ["TO DO", "IN PROGRESS", "DONE"].includes(
        reqBody.status
      );
      if (isValidStatus) {
        updateColumn = "Status";
        updateQuery(updateColumn);
      } else {
        res.status(400);
        res.send("Invalid Todo Status");
      }
      break;

    case reqBody.priority !== undefined:
      const isValidPriority = ["LOW", "MEDIUM", "HIGH"].includes(
        reqBody.priority
      );
      if (isValidPriority) {
        updateColumn = "Priority";
        updateQuery(updateColumn);
      } else {
        res.status(400);
        res.send("Invalid Todo Priority");
      }
      break;

    case reqBody.category !== undefined:
      const isValidCategory = ["HOME", "WORK", "LEARNING"].includes(
        reqBody.category
      );
      if (isValidCategory) {
        updateColumn = "Category";
        updateQuery(updateColumn);
      } else {
        res.status(400);
        res.send("Invalid Todo Category");
      }
      break;

    case reqBody.dueDate !== undefined:
      updateColumn = "Due Date";
      updateDueDate(updateColumn);
      break;

    case reqBody.todo !== undefined:
      updateColumn = "Todo";
      updateQuery(updateColumn);
      break;
  }
});

// Delete Todo API 6
app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const deleteTodoQuery = `
    DELETE FROM
        todo
    WHERE
        id = ${todoId};`;
  await db.run(deleteTodoQuery);
  res.send("Todo Deleted");
});

module.exports = app;
