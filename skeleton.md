npx sequelize-cli model:generate --name Category --attributes name:string

npx sequelize-cli model:generate --name Status --attributes name:string

npx sequelize-cli model:generate --name Product --attributes id_produk:string,nama_produk:string,harga:decimal,kategori_id:integer,status_id:integer

npx sequelize-cli model:generate --name User --attributes username:string,email:string,password:string

npx sequelize-cli model:generate --name Cart --attributes user_id:integer,product_id:integer,quantity:integer

npx sequelize-cli model:generate --name Order --attributes user_id:integer,total:decimal,status:string
