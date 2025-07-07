/**
 * Функция для расчета прибыли
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
  // @TODO: Расчет прибыли от операции
  const { discount, sale_price, quantity } = purchase;
  const revenue = sale_price * quantity * (1 - discount / 100);
  return revenue;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
  // @TODO: Расчет бонуса от позиции в рейтинге
  const { profit } = seller;
  if (index === 0) {
    return 15;
  } else if (index === 1 || index === 2) {
    return 10;
  } else if (index !== total - 1) {
    return 5;
  } else {
    return 0;
  }
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
  // @TODO: Проверка входных данных
  if (!data || typeof data !== "object") {
    throw new Error("Invalid data: expected object");
  }

  // @TODO: Проверка наличия опций
  if (!options || typeof options !== "object") {
    throw new Error("Invalid options: expected object");
  }

  const { calculateRevenue, calculateBonus } = options;

  if (typeof calculateRevenue !== "function") {
    throw new Error("calculateRevenue function is required");
  }

  if (typeof calculateBonus !== "function") {
    throw new Error("calculateBonus function is required");
  }
  // @TODO: Подготовка промежуточных данных для сбора статистики
  // @TODO: Индексация продавцов и товаров для быстрого доступа
  // @TODO: Расчет выручки и прибыли для каждого продавца
  const sellers = {};
  data.purchase_records.forEach((sale) => {
    const product = data.products.find((p) => p.sku === sale.sku);
    const revenue = calculateRevenue(record, product);
    const profit = revenue - product.purchase_price * sale.quantity;

    if (!sellers[sale.seller_id]) {
      sellers[sale.seller_id] = {
        id: sale.seller_id,
        totalRevenue: 0,
        profit: 0,
      };
    }
    sellers[sale.seller_id].totalRevenue += revenue;
    sellers[sale.seller_id].profit += profit;
  });

  // @TODO: Сортировка продавцов по прибыли
  const sortedSellers = Object.values(sellers).sort(
    (a, b) => b.profit - a.profit
  );

  // @TODO: Назначение премий на основе ранжирования
  const sellersWithBonus = sortedSellers.map((seller, index) => ({
    seller_id: seller.id,
    revenue: seller.totalRevenue,
    profit: seller.profit,
    bonus: calculateBonus(index, sortedSellers.length, seller),
  }));
  // @TODO: Подготовка итоговой коллекции с нужными полями
  const total = (key) =>
    sellersWithBonus.reduce((sum, seller) => sum + seller[key], 0);

  return {
    summary: {
      totalRevenue: total("revenue"),
      totalProfit: total("profit"),
      totalBonus: total("bonus"),
    },
    sellers: sellersWithBonus,
  };
}
