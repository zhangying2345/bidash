#### 1.接口功能
> 获取所有dataSource
#### URL(get)
> http://47.101.11.236/api/v1/dataSource
#### 请求参数
无

#### 2.接口功能
> 获取某个dataSource
#### URL(get)
> http://47.101.11.236/api/v1/dataSource?id=1
#### 请求参数
参数|必选|说明|类型
---|:--:|---:|---
id|true|对应id|string

#### 3.接口功能
> 新增dataSource
#### URL(post)
> http://47.101.11.236/api/v1/dataSource
#### 请求参数
参数|必选|说明|类型
---|:--:|:---:|---
name|true|对应name|string
dataSource|true|对应dataSource|Object

#### 4.接口功能
> 删除某个dataSource
#### URL(delete)
> http://47.101.11.236/api/v1/dataSource?id=1
#### 请求参数
参数|必选|说明|类型
---|:--:|:---:|---
id|true|对应id|string

#### 5.接口功能
> 修改某个dataSource
#### URL(put)
> http://47.101.11.236/api/v1/dataSource
#### 请求参数
参数|必选|说明|类型
---|:--:|:---:|---
id|true|对应id|string
name|true|对应name|string
dataSource|true|对应dataSource|Object

#### 6.接口功能
> 根据name搜索
#### URL(get)
> http://47.101.11.236/api/v1/searchByName?name=test
#### 请求参数
参数|必选|说明|类型
---|:--:|:---:|---
name|true|对应name|string
