exports.index = (req, res) => {
  try {
    return res.render('reports');
  } catch (error) {
    console.error(error);
    return res.render('500');
  }
};
