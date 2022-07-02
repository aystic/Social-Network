/* const { buildSchema } = require("graphql");

// module.exports = buildSchema(`
// 	type TestData{
// 		text: String!
// 		value: Int!
// 	}

// 	type RootQuery{
// 		hello : TestData!
// 	}

// schema {
// 	query: RootQuery
// }
// `);

module.exports = buildSchema(`
	type Post{
		_id: ID!
		title: String!
		content: String!
		imageUrl: String!
		creator: User!
		createdAt: String!
		updatedAt: String!
	}

	type User{
		_id: ID!
		name: String!
		email: String!
		password: String
		status: String!
		post: [Post!]!
	}

	input UserInputData{
		email: String!
		name: String!
		password: String!
	}

	type RootMutation{
		createUser(UserInput:UserInputData): User!
	}

	type TestData{
 		text: String!
 		value: Int!
 	}

 	type RootQuery{
 		hello : TestData!
 	}

	schema {
		query: RootQuery
		mutation: RootMutation
	}
`);
 */
