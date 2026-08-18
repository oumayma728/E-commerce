'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserEvent = sequelize.define('UserEvent', {
    id: {
      type: DataTypes.TEXT, // UUID stocké comme TEXT
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'user_id',
      validate: {
        notEmpty: {
          msg: 'L\'utilisateur est obligatoire'
        }
      }
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'event_type',
      validate: {
        notEmpty: {
          msg: 'Le type d\'événement est obligatoire'
        },
        isIn: {
          args: [['view', 'purchase']],
          msg: 'Le type d\'événement doit être "view" ou "purchase"'
        }
      }
    },
    productId: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'product_id'
    },
    productIds: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
      field: 'product_ids'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'total_amount',
      validate: {
        min: {
          args: [0],
          msg: 'Le montant total ne peut pas être négatif'
        }
      }
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'session_id'
    }
  }, {
    tableName: 'user_events',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['product_id'] },
      { fields: ['event_type'] },
      { fields: ['session_id'] }
    ]
  });

  UserEvent.associate = (models) => {
    if (models.User) {
      UserEvent.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE'
      });
    }
    if (models.Product) {
      UserEvent.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product',
        onDelete: 'CASCADE'
      });
    }
  };

  return UserEvent;
};
