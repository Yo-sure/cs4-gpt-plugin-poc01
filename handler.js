module.exports.hello = async (event) => ({
  statusCode: 200,
  body: JSON.stringify(
    {
      message: 'Function executed successfully!',
      input: event,
    },
    null,
    2,
  ),
});
