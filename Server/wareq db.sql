{
    "type": "MySQLNotebook",
    "version": "1.0",
    "caption": "DB Notebook",
    "content": "\\about\n-- ================================================\n-- Wareq Database - وارق\n-- ================================================\n\nCREATE DATABASE IF NOT EXISTS wareq_db\n  CHARACTER SET utf8mb4\n  COLLATE utf8mb4_unicode_ci;\n\nUSE wareq_db;\n\n-- ================================================\n-- Users\n-- ================================================\nCREATE TABLE Users (\n  user_id             INT             AUTO_INCREMENT PRIMARY KEY,\n  username            VARCHAR(100)    NOT NULL UNIQUE,\n  email               VARCHAR(255)    NOT NULL UNIQUE,\n  password_hash       VARCHAR(255)    NOT NULL,\n  subscription_status VARCHAR(20)     NOT NULL DEFAULT 'Free'\n                        CHECK (subscription_status IN ('Free', 'Basic', 'Pro')),\n  role                VARCHAR(20)     NOT NULL DEFAULT 'user'\n                        CHECK (role IN ('user', 'admin')),\n  created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP\n);\n\n-- ================================================\n-- Plants\n-- ================================================\nCREATE TABLE Plants (\n  plant_id    INT           AUTO_INCREMENT PRIMARY KEY,\n  user_id     INT           NOT NULL,\n  plant_name  VARCHAR(150)  NOT NULL,\n  species     VARCHAR(150),\n  sand_type   VARCHAR(50),\n  season_info VARCHAR(100),\n  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,\n\n  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE\n);\n\n-- ================================================\n-- Diagnostics\n-- ================================================\nCREATE TABLE Diagnostics (\n  diag_id        INT           AUTO_INCREMENT PRIMARY KEY,\n  plant_id       INT           NOT NULL,\n  image_url      VARCHAR(500),\n  infection_name VARCHAR(200),\n  integrity_rate FLOAT,\n  processed_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,\n\n  FOREIGN KEY (plant_id) REFERENCES Plants(plant_id) ON DELETE CASCADE\n);\n\n-- ================================================\n-- Reports\n-- ================================================\nCREATE TABLE Reports (\n  report_id    INT         AUTO_INCREMENT PRIMARY KEY,\n  diag_id      INT         NOT NULL,\n  prescription TEXT,\n  generated_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,\n\n  FOREIGN KEY (diag_id) REFERENCES Diagnostics(diag_id) ON DELETE CASCADE\n);\n\n-- ================================================\n-- Payments\n-- ================================================\nCREATE TABLE Payments (\n  payment_id      INT           AUTO_INCREMENT PRIMARY KEY,\n  user_id         INT           NOT NULL,\n  bank_account    VARCHAR(100),\n  is_verified     BOOLEAN       DEFAULT FALSE,\n  payment_method  VARCHAR(50),\n  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,\n\n  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE\n);\n\n-- ================================================\n-- Posts\n-- ================================================\nCREATE TABLE Posts (\n  post_id     INT           AUTO_INCREMENT PRIMARY KEY,\n  user_id     INT           NOT NULL,\n  title       VARCHAR(255)  NOT NULL,\n  content     TEXT,\n  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,\n\n  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE\n);\n\n-- ================================================\n-- Weather_Logs\n-- ================================================\nCREATE TABLE Weather_Logs (\n  log_id          INT           AUTO_INCREMENT PRIMARY KEY,\n  location_coord  VARCHAR(100),\n  temperature     FLOAT,\n  condition_desc  VARCHAR(200),\n  captured_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP\n);\n\n-- ================================================\n-- Notifications\n-- ================================================\nCREATE TABLE Notifications (\n  notif_id    INT         AUTO_INCREMENT PRIMARY KEY,\n  log_id      INT,\n  plant_id    INT         NOT NULL,\n  type        VARCHAR(50),\n  status      VARCHAR(20) DEFAULT 'unread'\n                CHECK (status IN ('unread', 'read')),\n  created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,\n\n  FOREIGN KEY (log_id)   REFERENCES Weather_Logs(log_id) ON DELETE SET NULL,\n  FOREIGN KEY (plant_id) REFERENCES Plants(plant_id)     ON DELETE CASCADE\n);\n\n-- ================================================\n-- Done!\n-- ================================================\nSELECT 'Wareq DB created successfully! 🌱' AS status;\n",
    "options": {
        "tabSize": 4,
        "insertSpaces": true,
        "indentSize": 4,
        "defaultEOL": "CRLF",
        "trimAutoWhitespace": true
    },
    "viewState": {
        "cursorState": [
            {
                "inSelectionMode": false,
                "selectionStart": {
                    "lineNumber": 8,
                    "column": 30
                },
                "position": {
                    "lineNumber": 8,
                    "column": 30
                }
            }
        ],
        "viewState": {
            "scrollLeft": 0,
            "firstPosition": {
                "lineNumber": 1,
                "column": 1
            },
            "firstPositionDeltaTop": 0
        },
        "contributionsState": {
            "editor.contrib.folding": {},
            "editor.contrib.wordHighlighter": false
        }
    },
    "contexts": [
        {
            "state": {
                "start": 1,
                "end": 1,
                "language": "mysql",
                "result": {
                    "type": "text",
                    "text": [
                        {
                            "type": 2,
                            "content": "Welcome to the MySQL Shell - DB Notebook.\n\nPress Ctrl+Enter to execute the code block.\n\nExecute \\sql to switch to SQL, \\js to JavaScript and \\ts to TypeScript mode.\nExecute \\help or \\? for help;",
                            "language": "ansi"
                        }
                    ]
                },
                "currentHeight": 118.390625,
                "currentSet": 1,
                "statements": [
                    {
                        "delimiter": ";",
                        "span": {
                            "start": 0,
                            "length": 6
                        },
                        "contentStart": 0,
                        "state": 0
                    }
                ]
            },
            "data": []
        },
        {
            "state": {
                "start": 2,
                "end": 125,
                "language": "mysql",
                "result": {
                    "type": "resultIds",
                    "list": [
                        "2d89c787-cb0f-49bd-c4d9-b1b9da13ec27",
                        "0fa9285f-e0ab-4ab3-e3c5-b504982720fe",
                        "86dfd345-c5b3-4fe4-cfb1-a0efa760207b",
                        "39079cab-792c-402d-bc79-363718db1bcc",
                        "ef305e8b-e48b-4bc5-d8e0-44c88aecb8a8",
                        "c24b1d32-e743-47c0-c09a-b2368da2bee7",
                        "46bf95c0-8fd5-4bea-c5dd-553023327799",
                        "6f41dc83-66c6-44ed-ef9e-e452bb85457c",
                        "d4c5b253-0591-4a6f-a69e-af019e77dfd7",
                        "d79cac3f-38bd-4969-bbc2-324d2bc642a6",
                        "87544cad-2b9a-46bb-b2f1-f97ce89c7830"
                    ]
                },
                "currentHeight": 118.796875,
                "currentSet": 1,
                "statements": [
                    {
                        "delimiter": ";",
                        "span": {
                            "start": 0,
                            "length": 222
                        },
                        "contentStart": 130,
                        "state": 0
                    },
                    {
                        "delimiter": ";",
                        "span": {
                            "start": 222,
                            "length": 15
                        },
                        "contentStart": 224,
                        "state": 0
                    },
                    {
                        "delimiter": ";",
                        "span": {
                            "start": 237,
                            "length": 690
                        },
                        "contentStart": 352,
                        "state": 0
                    },
                    {
                        "delimiter": ";",
                        "span": {
                            "start": 927,
                            "length": 479
                        },
                        "contentStart": 1043,
                        "state": 0
                    },
                    {
                        "delimiter": ";",
                        "span": {
                            "start": 1406,
                            "length": 466
                        },
                        "contentStart": 1527,
                        "state": 0
                    },
                    {
                        "delimiter": ";",
                        "span": {
                            "start": 1872,
                            "length": 384
                        },
                        "contentStart": 1989,
                        "state": 0
                    },
                    {
                        "delimiter": ";",
                        "span": {
                            "start": 2256,
                            "length": 484
                        },
                        "contentStart": 2374,
                        "state": 0
                    },
                    {
                        "delimiter": ";",
                        "span": {
                            "start": 2740,
                            "length": 414
                        },
                        "contentStart": 2855,
                        "state": 0
                    },
                    {
                        "delimiter": ";",
                        "span": {
                            "start": 3154,
                            "length": 359
                        },
                        "contentStart": 3276,
                        "state": 0
                    },
                    {
                        "delimiter": ";",
                        "span": {
                            "start": 3513,
                            "length": 593
                        },
                        "contentStart": 3636,
                        "state": 0
                    },
                    {
                        "delimiter": ";",
                        "span": {
                            "start": 4106,
                            "length": 168
                        },
                        "contentStart": 4221,
                        "state": 0
                    }
                ]
            },
            "data": [
                {
                    "tabId": "f71cd1bc-b1f3-4f79-ba71-8e04baf1c50f",
                    "resultId": "2d89c787-cb0f-49bd-c4d9-b1b9da13ec27",
                    "rows": [
                        {
                            "0": "Wareq DB created successfully! 🌱"
                        }
                    ],
                    "columns": [
                        {
                            "title": "status",
                            "field": "0",
                            "dataType": {
                                "type": 17,
                                "characterMaximumLength": 65535,
                                "flags": [
                                    "BINARY",
                                    "ASCII",
                                    "UNICODE"
                                ],
                                "needsQuotes": true,
                                "parameterFormatType": "OneOrZero"
                            },
                            "inPK": false,
                            "nullable": false,
                            "autoIncrement": false
                        }
                    ],
                    "executionInfo": {
                        "text": "OK, 1 record retrieved in 1.161ms"
                    },
                    "totalRowCount": 1,
                    "hasMoreRows": false,
                    "currentPage": 0,
                    "index": 10,
                    "sql": "\n\n-- ================================================\n-- Done!\n-- ================================================\nSELECT 'Wareq DB created successfully! 🌱' AS status",
                    "updatable": false,
                    "fullTableName": ""
                },
                {
                    "tabId": "f71cd1bc-b1f3-4f79-ba71-8e04baf1c50f",
                    "resultId": "0fa9285f-e0ab-4ab3-e3c5-b504982720fe",
                    "rows": [],
                    "columns": [
                        {
                            "title": "*",
                            "field": "0",
                            "dataType": {
                                "type": 0
                            },
                            "inPK": false,
                            "nullable": false,
                            "autoIncrement": false
                        }
                    ],
                    "executionInfo": {
                        "text": "OK, 1 row affected in 50.195ms"
                    },
                    "totalRowCount": 0,
                    "hasMoreRows": false,
                    "currentPage": 0,
                    "index": 0,
                    "sql": "-- ================================================\n-- Wareq Database - وارق\n-- ================================================\n\nCREATE DATABASE IF NOT EXISTS wareq_db\n  CHARACTER SET utf8mb4\n  COLLATE utf8mb4_unicode_ci",
                    "updatable": false
                },
                {
                    "tabId": "f71cd1bc-b1f3-4f79-ba71-8e04baf1c50f",
                    "resultId": "86dfd345-c5b3-4fe4-cfb1-a0efa760207b",
                    "rows": [],
                    "columns": [
                        {
                            "title": "*",
                            "field": "0",
                            "dataType": {
                                "type": 0
                            },
                            "inPK": false,
                            "nullable": false,
                            "autoIncrement": false
                        }
                    ],
                    "executionInfo": {
                        "text": "OK, 0 records retrieved in 1.548ms"
                    },
                    "totalRowCount": 0,
                    "hasMoreRows": false,
                    "currentPage": 0,
                    "index": 1,
                    "sql": "\n\nUSE wareq_db",
                    "updatable": false
                },
                {
                    "tabId": "f71cd1bc-b1f3-4f79-ba71-8e04baf1c50f",
                    "resultId": "39079cab-792c-402d-bc79-363718db1bcc",
                    "rows": [],
                    "columns": [
                        {
                            "title": "*",
                            "field": "0",
                            "dataType": {
                                "type": 0
                            },
                            "inPK": false,
                            "nullable": false,
                            "autoIncrement": false
                        }
                    ],
                    "executionInfo": {
                        "text": "OK, 0 records retrieved in 106.201ms"
                    },
                    "totalRowCount": 0,
                    "hasMoreRows": false,
                    "currentPage": 0,
                    "index": 2,
                    "sql": "\n\n-- ================================================\n-- Users\n-- ================================================\nCREATE TABLE Users (\n  user_id             INT             AUTO_INCREMENT PRIMARY KEY,\n  username            VARCHAR(100)    NOT NULL UNIQUE,\n  email               VARCHAR(255)    NOT NULL UNIQUE,\n  password_hash       VARCHAR(255)    NOT NULL,\n  subscription_status VARCHAR(20)     NOT NULL DEFAULT 'Free'\n                        CHECK (subscription_status IN ('Free', 'Basic', 'Pro')),\n  role                VARCHAR(20)     NOT NULL DEFAULT 'user'\n                        CHECK (role IN ('user', 'admin')),\n  created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP\n)",
                    "updatable": false
                },
                {
                    "tabId": "f71cd1bc-b1f3-4f79-ba71-8e04baf1c50f",
                    "resultId": "ef305e8b-e48b-4bc5-d8e0-44c88aecb8a8",
                    "rows": [],
                    "columns": [
                        {
                            "title": "*",
                            "field": "0",
                            "dataType": {
                                "type": 0
                            },
                            "inPK": false,
                            "nullable": false,
                            "autoIncrement": false
                        }
                    ],
                    "executionInfo": {
                        "text": "OK, 0 records retrieved in 35.318ms"
                    },
                    "totalRowCount": 0,
                    "hasMoreRows": false,
                    "currentPage": 0,
                    "index": 3,
                    "sql": "\n\n-- ================================================\n-- Plants\n-- ================================================\nCREATE TABLE Plants (\n  plant_id    INT           AUTO_INCREMENT PRIMARY KEY,\n  user_id     INT           NOT NULL,\n  plant_name  VARCHAR(150)  NOT NULL,\n  species     VARCHAR(150),\n  sand_type   VARCHAR(50),\n  season_info VARCHAR(100),\n  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,\n\n  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE\n)",
                    "updatable": false
                },
                {
                    "tabId": "f71cd1bc-b1f3-4f79-ba71-8e04baf1c50f",
                    "resultId": "c24b1d32-e743-47c0-c09a-b2368da2bee7",
                    "rows": [],
                    "columns": [
                        {
                            "title": "*",
                            "field": "0",
                            "dataType": {
                                "type": 0
                            },
                            "inPK": false,
                            "nullable": false,
                            "autoIncrement": false
                        }
                    ],
                    "executionInfo": {
                        "text": "OK, 0 records retrieved in 33.216ms"
                    },
                    "totalRowCount": 0,
                    "hasMoreRows": false,
                    "currentPage": 0,
                    "index": 4,
                    "sql": "\n\n-- ================================================\n-- Diagnostics\n-- ================================================\nCREATE TABLE Diagnostics (\n  diag_id        INT           AUTO_INCREMENT PRIMARY KEY,\n  plant_id       INT           NOT NULL,\n  image_url      VARCHAR(500),\n  infection_name VARCHAR(200),\n  integrity_rate FLOAT,\n  processed_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,\n\n  FOREIGN KEY (plant_id) REFERENCES Plants(plant_id) ON DELETE CASCADE\n)",
                    "updatable": false
                },
                {
                    "tabId": "f71cd1bc-b1f3-4f79-ba71-8e04baf1c50f",
                    "resultId": "46bf95c0-8fd5-4bea-c5dd-553023327799",
                    "rows": [],
                    "columns": [
                        {
                            "title": "*",
                            "field": "0",
                            "dataType": {
                                "type": 0
                            },
                            "inPK": false,
                            "nullable": false,
                            "autoIncrement": false
                        }
                    ],
                    "executionInfo": {
                        "text": "OK, 0 records retrieved in 30.051ms"
                    },
                    "totalRowCount": 0,
                    "hasMoreRows": false,
                    "currentPage": 0,
                    "index": 5,
                    "sql": "\n\n-- ================================================\n-- Reports\n-- ================================================\nCREATE TABLE Reports (\n  report_id    INT         AUTO_INCREMENT PRIMARY KEY,\n  diag_id      INT         NOT NULL,\n  prescription TEXT,\n  generated_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,\n\n  FOREIGN KEY (diag_id) REFERENCES Diagnostics(diag_id) ON DELETE CASCADE\n)",
                    "updatable": false
                },
                {
                    "tabId": "f71cd1bc-b1f3-4f79-ba71-8e04baf1c50f",
                    "resultId": "6f41dc83-66c6-44ed-ef9e-e452bb85457c",
                    "rows": [],
                    "columns": [
                        {
                            "title": "*",
                            "field": "0",
                            "dataType": {
                                "type": 0
                            },
                            "inPK": false,
                            "nullable": false,
                            "autoIncrement": false
                        }
                    ],
                    "executionInfo": {
                        "text": "OK, 0 records retrieved in 31.159ms"
                    },
                    "totalRowCount": 0,
                    "hasMoreRows": false,
                    "currentPage": 0,
                    "index": 6,
                    "sql": "\n\n-- ================================================\n-- Payments\n-- ================================================\nCREATE TABLE Payments (\n  payment_id      INT           AUTO_INCREMENT PRIMARY KEY,\n  user_id         INT           NOT NULL,\n  bank_account    VARCHAR(100),\n  is_verified     BOOLEAN       DEFAULT FALSE,\n  payment_method  VARCHAR(50),\n  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,\n\n  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE\n)",
                    "updatable": false
                },
                {
                    "tabId": "f71cd1bc-b1f3-4f79-ba71-8e04baf1c50f",
                    "resultId": "d4c5b253-0591-4a6f-a69e-af019e77dfd7",
                    "rows": [],
                    "columns": [
                        {
                            "title": "*",
                            "field": "0",
                            "dataType": {
                                "type": 0
                            },
                            "inPK": false,
                            "nullable": false,
                            "autoIncrement": false
                        }
                    ],
                    "executionInfo": {
                        "text": "OK, 0 records retrieved in 28.697ms"
                    },
                    "totalRowCount": 0,
                    "hasMoreRows": false,
                    "currentPage": 0,
                    "index": 7,
                    "sql": "\n\n-- ================================================\n-- Posts\n-- ================================================\nCREATE TABLE Posts (\n  post_id     INT           AUTO_INCREMENT PRIMARY KEY,\n  user_id     INT           NOT NULL,\n  title       VARCHAR(255)  NOT NULL,\n  content     TEXT,\n  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,\n\n  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE\n)",
                    "updatable": false
                },
                {
                    "tabId": "f71cd1bc-b1f3-4f79-ba71-8e04baf1c50f",
                    "resultId": "d79cac3f-38bd-4969-bbc2-324d2bc642a6",
                    "rows": [],
                    "columns": [
                        {
                            "title": "*",
                            "field": "0",
                            "dataType": {
                                "type": 0
                            },
                            "inPK": false,
                            "nullable": false,
                            "autoIncrement": false
                        }
                    ],
                    "executionInfo": {
                        "text": "OK, 0 records retrieved in 15.946ms"
                    },
                    "totalRowCount": 0,
                    "hasMoreRows": false,
                    "currentPage": 0,
                    "index": 8,
                    "sql": "\n\n-- ================================================\n-- Weather_Logs\n-- ================================================\nCREATE TABLE Weather_Logs (\n  log_id          INT           AUTO_INCREMENT PRIMARY KEY,\n  location_coord  VARCHAR(100),\n  temperature     FLOAT,\n  condition_desc  VARCHAR(200),\n  captured_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP\n)",
                    "updatable": false
                },
                {
                    "tabId": "f71cd1bc-b1f3-4f79-ba71-8e04baf1c50f",
                    "resultId": "87544cad-2b9a-46bb-b2f1-f97ce89c7830",
                    "rows": [],
                    "columns": [
                        {
                            "title": "*",
                            "field": "0",
                            "dataType": {
                                "type": 0
                            },
                            "inPK": false,
                            "nullable": false,
                            "autoIncrement": false
                        }
                    ],
                    "executionInfo": {
                        "text": "OK, 0 records retrieved in 32.589ms"
                    },
                    "totalRowCount": 0,
                    "hasMoreRows": false,
                    "currentPage": 0,
                    "index": 9,
                    "sql": "\n\n-- ================================================\n-- Notifications\n-- ================================================\nCREATE TABLE Notifications (\n  notif_id    INT         AUTO_INCREMENT PRIMARY KEY,\n  log_id      INT,\n  plant_id    INT         NOT NULL,\n  type        VARCHAR(50),\n  status      VARCHAR(20) DEFAULT 'unread'\n                CHECK (status IN ('unread', 'read')),\n  created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,\n\n  FOREIGN KEY (log_id)   REFERENCES Weather_Logs(log_id) ON DELETE SET NULL,\n  FOREIGN KEY (plant_id) REFERENCES Plants(plant_id)     ON DELETE CASCADE\n)",
                    "updatable": false
                }
            ]
        },
        {
            "state": {
                "start": 126,
                "end": 126,
                "language": "mysql",
                "currentSet": 1,
                "statements": [
                    {
                        "delimiter": ";",
                        "span": {
                            "start": 0,
                            "length": 0
                        },
                        "contentStart": 0,
                        "state": 0
                    }
                ]
            },
            "data": []
        }
    ]
}