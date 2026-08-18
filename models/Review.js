'use strict';

module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.TEXT, // UUID stocké comme TEXT (cohérence avec la DB existante)
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.TEXT, // UUID de l'utilisateur
      allowNull: false,
      field: 'user_id', // Mapping vers la colonne snake_case
      validate: {
        notEmpty: {
          msg: 'L\'utilisateur est obligatoire'
        }
      }
    },
    productId: {
      type: DataTypes.TEXT, // UUID du produit
      allowNull: false,
      field: 'product_id', // Mapping vers la colonne snake_case
      validate: {
        notEmpty: {
          msg: 'Le produit est obligatoire'
        }
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: 'La note doit être un nombre entier'
        },
        min: {
          args: [1],
          msg: 'La note doit être au minimum de 1'
        },
        max: {
          args: [5],
          msg: 'La note doit être au maximum de 5'
        }
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: 'Le commentaire ne peut pas dépasser 500 caractères'
        }
      }
    }
  }, {
    tableName: 'reviews',
    timestamps: true,
    underscored: true,
    paranoid: false,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['product_id'] },
      { fields: ['rating'] },
      { fields: ['created_at'] },
      {
        unique: true,
        fields: ['user_id', 'product_id'],
        name: 'unique_user_product_review'
      }
    ]
  });

  Review.associate = (models) => {
    if (models.User) {
      Review.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE'
      });
    }
    if (models.Product) {
      Review.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product',
        onDelete: 'CASCADE'
      });
    }
  };

  return Review;
};
