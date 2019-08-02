# 如何发布一个基于Typescript的库软件包

本文说明如何制作一个基于Typescript进行开发的软件库，并支持node.js和以Typescript作为前端开发语言的应用程序的使用，并把它发布到任何npm仓库中，比如官方的npm仓库，或者基于sonatype's nexus创建私有npm仓库。

## 准备工作

### npm官方仓库

- npm的账号
- 创建自己的scope名称

### nexus oss中的npm仓库

- 安装nexus oss
- 添加npm仓库，设置为host类型

## 开发工作

- 编写基于Typescript的代码

  - 将入口文件定义为`index.ts`，这是一种约定，其中的内容仅仅是重新导出其它目录下的内容。

  - 参考：`lib/index.ts`, `lib/log/index.ts`。

- 编写单元测试代码

- 定义typedoc配置文件，用于生成`API Doc`

- 定义`tsconfig.json`文件

  - 其中需要设置`declaration`为`true`。参考：https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html
  - 参考`config/tsconfig.json`中的内容

  ```json
  ...
  "compilerOptions": {
      ...
      "declaration": true, // generate .d.ts file
      "module": "commonjs", // 生成支持node.js的库
      "moduleResolution": "node",
      "target": "es5",
      ...
    }
  ...
  ```

- 定义`package.json`文件

  - 要发布的，就不能含有`private: true`，同时设置好`main`, `types`。参考：https://docs.npmjs.com/getting-started/using-a-package.json

  - 参考`package.json`中的内容

  ```json
  ...
  "main": "dist/index.js",  // 这里指向编译后的js文件
  "types": "dist/index.d.ts", // 这个.d.ts文件不需要自己写，上面tsconfig.json中设置了declaration，会自动生成
  "repository": {     // 说明源代码仓库
    "type": "git",
    "url": "https://github.com/ashleygwilliams/my_package.git"
  },
  "homepage": "https://github.com/ashleygwilliams/my_package" // 说明项目主页地址
  ...
  ```

- 定义`.npmignore`文件

  - 其内容的格式同`.gitignore`。虽然npm一样会去看`.gitignore`文件，但是`.npmignore`文件不可或缺

- 使用Rollup工具进行bundle

  - 可以将分散的.js文件合成一个.js文件，用于发布
  - 通过插件可以进行代码的混淆(丑化)、压缩
  - Rollup用于lib的bundle，Webpack用于app的bundle

## 发布包内容

- 有一些文件，是npm默认就会包含的，写在'.npmignore'中也没用
  - package.json
  - README(.md)
  - CHANGELOG(.md)
  - LICENSE(.md)
- 编译后的目标目录，比如`dist`，其中已经是javascript的文件了
  - 可以使用webpack进行bundle成一个文件
  - 提供用于生产环境的`.min.js`和开发调试的`.js`的2种文件
    - 用于生产环境的，须要经过uglify和压缩
- 文档
  - API Doc
  - 使用说明文档

## 发布前的测试

参考：https://docs.npmjs.com/misc/developers#before-publishing-make-sure-your-package-installs-and-works

### 测试功能是否正常

测试功能，就一定需要另一个app项目，来引用这个库。有几种方式进行测试：

- `npm link`
  - 在另一个要使用它的app项目中，调用`npm link <lib-name>`
    - 这样会污染npm global空间，如果遇到另一个同名的库，会有问题
    - app项目的package.json中不用写依赖，因为执行这个命令，就会直接在node_modules下建立一个符号链接
- 在另一个要使用它的app项目的package.json中写本地依赖
  - `"@llcpub/log": file:../lib-log-ts`
- `npm install -g .`，然后启动node-repl，通过`require`进行导入，注意，可以这样做的前提是这个库发布成支持node.js的commonjs模块

无论哪种方式， 代码里直接`import`或者`require`，而不是用相对路径进行导入。
  ```javascript
  const { LogOption, LogLevel, ConsoleLoger } = require('@llcpub/log');

  const logerOption = new LogOption();
  logerOption.logLevel = LogLevel.Debug;
  const loger = new ConsoleLoger(logerOption);

  loger.debug('hello, liblog, debug');
  loger.info('hello, liblog, info');
  ```
  ```typescript
  import { LogOption, LogLevel, ConsoleLoger } from '@llcpub/log';

  const logerOption = new LogOption();
  //logerOption.logLevel = LogLevel.Debug;
  const loger = new ConsoleLoger(logerOption);

  loger.debug('hello, liblog, debug');
  loger.info('hello, liblog, info');
  loger.warn('hello, liblog, warn');
  ```

### 测试安装是否成功

如果没有问题，说明将来发布到npm仓库中，也一样可以npm install

- `npm install -g .`
- local install
  ```bash
  cd ../some-other-folder
  npm install ../my-package
  ```

## 发布

参考：https://docs.npmjs.com/misc/developers

- 测试npm包的生成

  - 运行`npm pack`命令进行测试，会生成一个`<name>-<version>.tgz`的压缩包，这个压缩文件就是即将上传到npm仓库上的文件。name和version都是package.json中定义的值。
  - nexus 3.12.1的版本中已经提供直接通过web进行上传npm包，那就是把这个tgz包进行上传。

- 测试发布到npm仓库

  - 测试发布到本地搭建的nexus npm私有仓库
    - 首先切换registry: `npm config registry http://localhost:8082/repository/npm-private-dev/`
    - `npm adduser --registry http://localhost:8082/repository/npm-private-dev/ --scope=@llcpub`
      - 这里指定的scope要和package.json中定义的scope一致
    - `npm publish`
    - `npm info @<scope>/<name>@<version>`
    - `npm unpublish @<scope>/<name>@<version>`

  - 发布到npm官方仓库
    - 首先切换registry: `npm config registry https://registry.npmjs.org/`
    - `npm adduser --registry https://registry.npmjs.org/ --scope=@<your org name>`
      - 如果npm账户启用了2步验证，这里会要求输入验证码(Authenticator provided OTP)
      - 这里指定的scope要和package.json中定义的scope一致
    - `npm publish --access=public`
      - 如果定义的是一个`scoped package`，它默认是private，而且需要npm的付费用户才能publish。通过参数`--access=public`就可以publish一个scoped package
      - 如果在npm个人profile设置了publish也需要二步验证，那这里就需要输入二步验证的密码才能publish
      - 登录自己的npm账户，查看新增的package。默认情况下，npm会发邮件通知。
      - 发布之后，并不能马上在npm上查到发布的软件包，估计也是要24小时之后才生效
    - `npm unpublish @<scope>/<name>@<version> --otp=<xxxxxx>` 官方文档说在发布之后24小时之后在执行，就需要邮件通知npm才可以撤销了。参考：https://docs.npmjs.com/cli/unpublish
      - 如果设置了2步验证，需要添加参数`--otp`才能unpublish
