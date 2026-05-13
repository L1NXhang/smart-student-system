const success = (res, data, message = '操作成功') => {
  res.json({ code: 200, message, data });
};

const error = (res, message, code = 500) => {
  res.status(code).json({ code, message, data: null });
};

const paginate = (res, list, total, page, pageSize) => {
  res.json({
    code: 200,
    message: '获取成功',
    data: { list, total, page, pageSize }
  });
};

module.exports = { success, error, paginate };
