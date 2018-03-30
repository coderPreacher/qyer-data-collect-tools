'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Place', {
    id: { type: DataTypes.STRING ,allowNull: false,primaryKey: true} ,
    zh_name: DataTypes.STRING,
    parent_id: DataTypes.STRING,
    qyer_href: DataTypes.STRING,
    type: DataTypes.BIGINT,
    intro: DataTypes.TEXT,
    latitude: DataTypes.STRING,
    cover: DataTypes.STRING,
    qyer_star: DataTypes.FLOAT,
    qyer_rank: DataTypes.INTEGER,
    visited_number: DataTypes.FLOAT,
    longitude: DataTypes.STRING,
    qyer_map_href: DataTypes.STRING,
    qyer_attraction_href: DataTypes.STRING,
    booking_url: DataTypes.STRING,
    price_currency: DataTypes.STRING,
    reference_price: DataTypes.FLOAT,
    in_time: DataTypes.STRING,
    out_time: DataTypes.STRING,
    booking_information: DataTypes.TEXT,
    en_name: DataTypes.STRING,
  });
};