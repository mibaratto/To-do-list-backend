-- Active: 1685432141119@@127.0.0.1@3306

CREATE TABLE user (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE task (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TEXT DEFAULT (DATETIME()) NOT NULL,
    status INTEGER DEFAULT (0) NOT NULL
);

CREATE TABLE user_task (
    user_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (id),
    FOREIGN KEY (task_id) REFERENCES task (id) ON UPDATE CASCADE
);

INSERT INTO user (id, name, email, password)
    VALUES
        ("u001","Maria","maria@mail.com","maria123"),
        ("u002","Pedro","pedro@mail.com","pedro123"),
        ("u003","Joana","joana@mail.com","joana123"),
        ("u004","Luiz","luiz@mail.com","luiz123");

INSERT INTO task (id, title, description)
    VALUES
        ("t001","Implement Header","Creating header component"),
        ("t002","Implement Footer","Creating footer component"),
        ("t003","unit tests","Creating units test for react"),
        ("t004","Deploy","Deploy at surge");

INSERT INTO user_task (user_id, task_id)
    VALUES
        ("u001","t001"),
        ("u002","t002"),
        ("u001","t003"),
        ("u002","t003");

SELECT * FROM user;
SELECT * FROM task;
SELECT * FROM user_task;

 SELECT * FROM user_task
 INNER JOIN user
 ON user_task.user_id = user.id
 INNER JOIN task
 ON user_task.task_id = task.id;

 SELECT * FROM task
 INNER JOIN user_task
 ON user_task.task_id = task.id;

 SELECT * FROM task
 LEFT JOIN user_task
 ON user_task.task_id = task.id;

 SELECT * FROM task
 LEFT JOIN user_task
 ON user_task.task_id = task.id
 INNER JOIN user
 ON user_task.user_id = user.id;

 SELECT * FROM task
 LEFT JOIN user_task
 ON user_task.task_id = task.id
 LEFT JOIN user
 ON user_task.user_id = user.id;


DROP TABLE user;

DROP TABLE task;

DROP TABLE user_task;