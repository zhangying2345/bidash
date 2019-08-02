# 针对Typescript的单元测试和代码覆盖率的方案

本文描述对使用Typescript编写纯功能类库的单元测试和获得代码覆盖率的技术方案。

## 单元测试框架的选择

JS技术栈的单元测试框架主要是2个，说是测试框架，主要是指它们提供test runner的环境：

### Test Runner
- jasmine
  - jest，基于jasmine，主要用于react，都是facebook的
- mocha

### Test辅助类库
还有一些类库作为辅助

- chai: 断言库
- sinon：stub, fake库

它们和任何测试框架进行搭配：

- jasmine（自带断言API，所以不需要chai) + sinon
- mocha + chai + sinon

### 将单元测试跑在浏览器里

上面的技术方案都是直接在命令行下运行，查看结果的。karma则允许在浏览器上运行单元测试和进行调试。

Karma不是一个单元测试框架，它负责运行单元测试框架，以及提供丰富的插件，为这些测试框架提供辅助功能，比如语言的预处理、测试报告的选择，等等。它被称为**orchestrator（编排器）**

## 获取代码覆盖率的方案

上面的单元测试框架仅仅负责执行单元测试代码，并获取执行的结果，比如，成功的有几个，失败的有几个，等等。本质上就是调用node.js，执行的js代码。

要想获取代码覆盖率，必须通过别的工具和类库，js中就是`Istanbul`，它能生成LCOV的数据，才能通过它进一步得知代码覆盖率数据。

istanbul一类的类库有很多，目前比较活跃且稳定的是2.0的版本：

- https://istanbul.js.org/
- https://github.com/istanbuljs/istanbuljs (它提供很多npm包, istanbul-lib-coverage, istanbul-lib-report, 等等)

它提供一个cli工具，nyc:

- https://github.com/istanbuljs/nyc
- https://www.npmjs.com/package/nyc

1.0的版本已经废弃了，不过还有许多工具还依赖它，我们当然有限选择那些支持2.0版本的工具和类库：

- https://github.com/gotwarlost/istanbul
- https://www.npmjs.com/package/istanbul

### 什么是instrument

在nyc的配置选项中，有一个`instrument`的配置项，这是一个什么概念呢？

翻译成中文，可以是“检测”。它的含义是进行code coverage测试时，获取哪部分代码被执行，而哪些没有被执行，以及被执行的次数。

### sourcemaps的作用

因为我们用Typescript写代码，但最终会被转换成es5语法。有了sourcemaps，就可以建立es5语法的代码和原始代码之间的映射关系。

这样在调试测试代码的时候，我们都是针对原始代码，而不是转换后的es5的代码。

## 支持Typescript

按照目前浏览器和node.js的是实现，还处在ES5的阶段，而以上的单元测试框架和覆盖率工具，原生支持的程度也就是ES5。

对于ES6，虽然它是标准，是未来，但目前仍然需要通过Babel进行转译。

对于Typescript，也是一样的，需要专门的编译器进行转译。只不过它的转译对象可以是ES5, 也可以是ES6。

所以，对于这些非原生支持的JS，都需要额外插件/工具的支持。

### 理解处理的流程

那么在处理流程上：

- Babel

功能代码和测试代码都是ES6语法。

| 源代码 | 转译 | 执行单元测试 | 生成代码覆盖率 | 结果 |
| - | - | - | - | - |
| xxx.es6.js, xxx.es6.spec.js | babel | mocha, jasmine | istanbul | lcov.info, 单元测试执行报告 |

- Typescript

功能代码和测试代码都是Typescript语法。

| 源代码 | 转译 | 执行单元测试 | 生成代码覆盖率 | 结果 |
| - | - | - | - | - |
| xxx.ts, xxx.spec.ts | tsc, ts-node | mocha, jasmine | istanbul | lcov.info, 单元测试执行报告 |

本文测试Typescript的部分。

### 单元测试框架方案选择

我们使用mocha + chai + sinon，配合ts-node，支持Typescript的单元测试的执行。

#### npm软件包

```yaml
typescript: 2.5.3
ts-node: 7.0.0
mocha: 5.2.0 # test runner and framework
"@types/mocha": 5.2.4 # typescript
chai: 4.1.2 # asset library
"@types/chai": 4.1.4 # for typescript
sinon: 6.0.1 # fake, stub library
"@types/sinon": 5.0.1 # for typescript
```

#### 命令的执行

``` yaml
# package.json
scripts:
  test: mocha --require ts-node/register ./src/**/*.spec.ts --reporter list
```

在上面的命令中，通过给mocha指定参数`--require ts-node/register`，就会对.ts进行转译。最后的`--reporter`指定了生成的单元测试执行报告的格式。

mocha还支持`--grep xxx, --fgrep xxx`进行测试用例的设置，值可以是`describe`或者`it`语句中的字符串，这样可以实现单独执行某一个/某一些测试用例。

### 生成代码覆盖率的方案选择

我们使用`nyc`。参考: https://istanbul.js.org/docs/tutorials/typescript/

#### npm软件包

```yaml
nyc: 12.0.2 # Istanbul Cli
source-map-support: 0.5.6 # optional
```

#### nyc配置

可以放在单独的`.nycrc`中，也可以定义在`package.json`中。

```yaml
# package.yml
scripts:
  test:coverage: nyc mocha --require ts-node/register --require source-map-support/register --recursive ./src/**/*.spec.ts
nyc:
  check-coverage: true # optional, enable to check coverage gate
  per-file: false ## show summary coverage date, not for each file
  lines: 80 # optional, set lines coverage goal: 80%
  statements: 80 # optional, set statements coverage goal: 80%
  functions: 80 # optional, set functions coverage goal: 80%
  branches: 80 # optional, set branches coverage goal: 80%
  include: # must
    - src/**/*.ts
  exclude: # must
    - '**/*.d.ts'
    - '**/*.spec.ts'
  extension:
    - .ts # must
  reporter:
    - text # a table include statements, branches, function, lines for each file
    - text-summary # average statements, branches, function, lines for all files
    - lcov # include html: lcov-report/ and lcovonly: lcov.info
  sourceMap: true
  instrument: true
  cache: true
  clean: true # clean cache dir for each running
  all: true # cover all files match pattern in include but exclude
  temp-directory: .dist/reports
  report-dir: dist/reports
```

#### 命令的执行

根据上面定义在package.json中的定义，可以运行`npm run test:coverage`来执行单元测试，并生成代码覆盖率的数据。根据设置的reporter，会生成:

- dist/reports/lcov.info, 代码覆盖率数据文件，可以接着设置给其它代码质量的检查服务器，比如coveralls, codecov, sonarqube
- dist/reports/lcov-report/, 这是一个静态网站，可以通过浏览器查看测试结果

也可以直接通过`npx nyc mocha --require ts-node/register --require source-map-support/register --recursive ./src/**/*.spec.ts`在命令行下直接执行nyc，还可以继续添加mocha接受的`--grep|--fgrep`等参数。

## 使用Gulp进行任务的自动化管理

如果我们使用gulp替换package.json中的scripts，有2中方案：

- npm仓库上提供一些gulp的插件，比如`gulp-typescript`, `gulp-mocha`
- 直接通过子进程的调用

目前，如果使用前者，暂时没有调用nyc的gulp插件，所以需要通过第二种方法来调用nyc命令，如下：

```javascript
const CrossSpawn = require('cross-spawn');

CrossSpawn.sync('./node_modules/.bin/nyc', [
  './node_modules/.bin/mocha',
  '--require',
  'ts-node/register',
  '--require',
  'source-map-support/register',
  '--recursive',
  './src/**/*.spec.ts'
], {
  stdio: 'inherit'
});
```

这相当于定义在package.json scripts中的命令了，除了调用mocha的方式需要一点改变。

## 生成支持sonarqube的单元测试执行报告

这需要使用一个新的npm包: `mocha-sonarqube-reporter`, 并且修改`mocha`的参数：

`npx mocha --require ts-node/register --require source-map-support/register --recursive ./src/**/*.spec.ts --reporter mocha-sonarqube-reporter --reporter-options output=dist/reports/ut-report.xml`

这样，在sonarqube 6.x的配置文件中：`sonar.testExecutionReportPaths=dist/reports/ut-report.xml`

这个npm包仅仅支持sonarqube 6.x的版本，对于5.x的版本，目前还没有支持mocha的版本。

- 对于Jest，就有`jest-sonar-reporter`，同时支持sonarqube 5.x和6.x。
- 对于Karma，也有`karma-sonarqube-unit-reporter`，也同时支持。
  - **Todo**：也许后面可以改用karma + jasmine的方式，就可以用这个karma插件了。参考：https://ministryofdev.org/2016/12/08/unit-tests-tdd-with-typescript/

## mocha的watch模式

在开发期，启动watch模式很有用，不用重复启动，可以一直修改，直到测试通过。

要给mocha传递2个参数：`--watch-extensions ts`和`--watch`。如：

`npx mocha --require ts-node/register --require source-map-support/register --recursive ./src/**/*.spec.ts --reporter list --watch-extensions ts --watch`

启动nyc的时候，也可以给mocha传递这2个参数。

## VS Code中的插件支持

通过安装`Mocha sidebar`，可以在IDE中直接执行单元测试和调试，这样可以代替karma的浏览器调试了。

安装完之后，需要修改配置。在`.vscode/settings.json`中，新建：

```json
{
  "mocha.files.glob": "src/**/*.spec.ts", // 必须
  "mocha.requires": ["ts-node/register"], // 必须
  "mocha.coverage": { // optional
    "enable": true,
    "decoration": true,
    "runWithInterval": false,
    "autoUpdateInterval": 20000,
    "activeOnStart": true,
    "runAfterTest": false,
    "runCoverageAfterFileSave": false,
    "reporters": ["lcov"]
  }
}
```

这样重启vscode，在左侧panel上就能看一个`Test`的按钮，点击进入后，可以看到识别出来的所有Test Cases。这样就可以手动点击触发单元测试，并同时在测试代码中打断点进行调试了。
