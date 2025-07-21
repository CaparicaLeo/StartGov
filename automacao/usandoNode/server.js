const express = require("express");
const { gerarLista } = require("./scrapping");

const app = express();
app.use(express.json());

app.post("/gerar-lista", async (req, res) => {
	// ESTE LOG É A NOSSA PROVA!
	// Se a conexão funcionar, você verá esta mensagem no seu terminal.
	console.log(">>> Conexão recebida na rota /gerar-lista!");
	console.log(">>> Corpo da requisição (body):", req.body);

	try {
		const jsonData = req.body;

		// Lógica do seu scrapping (descomente quando precisar)
		// const resultado = await gerarLista(jsonData);

		// Linha corrigida: enviando uma resposta de sucesso com status 200
		res.status(200).json({
			status: "sucesso",
			mensagem: "Requisição recebida com sucesso pelo servidor!",
			dadosRecebidos: jsonData,
		});
	} catch (error) {
		console.error("Erro ao processar a rota /gerar-lista:", error);
		res.status(500).json({ status: "erro", mensagem: error.message });
	}
});

app.listen(3333, () => {
	console.log("Server started at port 3333");
});
