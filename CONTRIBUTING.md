# Contributing

We welcome contributions in several forms, e.g.

* Documenting
* Testing
* Coding
* etc.

## Prepare Development Environment

- OS: Windows 7+ X64, Linux Desktop X64(ex. Ubuntu 16.04 LTS+), MacOS 10+
- VS Code: Latest Stable LTS
- Git: Latest Stable version
- node, npm, yarn

It is recommended to use `NVM` to manage node versions

they are defined in package.json
```json
"engines": {
  "node": "^8.10.0",
  "npm": ">5.5.0 <=5.7.0",
  "yarn": "^1.7.0"
}
```

Recommended:

```bash
npm install -g yarn node-gyp nrm
```

- NPM/Yarn global packages

```bash
<yarn global add | npm install -g> gulp-cli js-yaml ts-node
```

## Prepare for development

Open git bash in windows, or Console/Terminal in Linux/OSX, run:

```bash
./script/prepare.sh
```

### Install MongoDB in local

We use MongdoDB Communication Edition (Latest Stable), the installation guide: https://docs.mongodb.com/manual/administration/install-community/

Also, we recommended to use MongoDB Compass as GUI tool to manipulate MongDB database. Ref: https://www.mongodb.com/download-center#compass

#### export, import data

There are 2 tools: `mongoexport` and `mongoimport` to help export or import data in document. These tools just deal with data in database, but not handle other parts, like indexes.

https://docs.mongodb.com/manual/reference/program/mongoexport/
https://docs.mongodb.com/manual/reference/program/mongoimport/

`mongoexport -h <mongoserver ip:port> -d <database name> -c <collection name> [-q <query string>] -o <filename.json>`

`mongoimport -h <mongoserver ip:port> -d <database name> -c <collection name> --file <filename.json> [--drop]`

`--drop` means override original data in database

#### dump, restore database

There are 2 tools: `mongodump` and `mongorestore` to help backup or recovery whole data in database. They genereate BSON data and metadata.

https://docs.mongodb.com/manual/reference/program/mongodump/
https://docs.mongodb.com/manual/reference/program/mongorestore/

- Backup and Recovery Whole Database
`mongodump -h <mongoserver ip:port> -d <database name> -o <output folder>`
`mongorestore -h <mongoserver ip:port> -d <database name> <output folder> [--drop]`

- Recovery Single collection
`mongorestore -h <mongoserver ip:port> -d <database name> -c <collection name> <output folder/../collection-name>.bson [--drop]`

### The MongoDB Server in Intranet Environment for prototype testing

It is: `mongodb://10.192.30.115:27017`

### The Kafka Server in Intranet Environment for prototype testing

It is: `10.192.30.115:2181` (actually, it is zookeeper server)

### The Kafka Server Hostname in Intranet Environment for integration testing

Check `config/app/config.test.yml`, we must set hostname for kafka servers

#### Windows

`C:\Windows\system32\drivers\etc\hosts`

#### Ubuntu

Modify `hosts` file, no need to reboot.

```
$ cat /etc/hosts

10.192.30.96  swarm-manager1
10.192.30.97	swarm-worker1
10.192.30.98	swarm-worker2

```

## Commands for local development

- Start to local development

  ```
  gulp [-V | -VV] [--type=<local|proto|test|prod>] [--case=<bf|xichai|scps|nexteer|...>]
  ```

  the value from `--type` & `--case` will decide which config file will be used in `src/services/configuration/config`.

  The config file names will match `config.<type>[.<case>].yml`

  `--case`, override the `build.case` value in config.default.yml

- Prepare the assets for deployment

  ```
  gulp deploy
  ```
  Check the folder: `dist/deploy`, it contains:
  - Transpiled typescript source codes
  - Docker configuration files
  - Swagger-gui portal
  - API Spec files

## Launch browser to check APIs(swagger-ui portal)

Open http://localhost:8190, check the portal, and http://localhost:8190/api to explore APIs.

- API Specfications are defined in `docs/api-specs`

## Remote debug

Ref: https://nodejs.org/en/docs/guides/debugging-getting-started/#enabling-remote-debugging-scenarios

We can use Chrome or VS Code to do remote debugging.

In Dockerfile, it already add '--inspect' argument, so if binding default `9229` port from docker container to host, then we can remote debug on deployed service.

## Git Guidelines

### Repository Structure

This project store codes in a remote branch "master".

### Git Commit

We use gerrit to do Code Review, there are some rules need to be followed when create a new git commit.

### Commit Message Format

Here is a template:

```
<oneline brief message for this commit>
// new line
- <more details with '-' if needed>
- <if has more details, put them in oneline one by one>
// new line
Partial: <related-JIRA-ID>   // in last line
```

Sample:

```
Implement login function

- update to 0.1.2 version
- finish login API spec

Change-Id: If70f3659ec870e4c85be2c941a4c4e26e0648a45 // this line is generated automatically, no need to write by manual
Partial: SCICDIGIBF-455
```

Also, it need `commit-msg` hook file in `.git/hooks/` to generate `Change-Id` automatically when writing commit message

### Submit commit to do Code Review

Use below command to submit commit to remote branch

```
git push origin HEAD:refs/for/master
```
