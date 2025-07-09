import json
from playwright.sync_api import sync_playwright

def fazer_login(usuario, senha):
    with sync_playwright() as p:
        # Escolha um diretório para armazenar os dados de usuário (cookies etc.)
        user_data_dir = './meu_perfil_de_usuario'

        # Executa o navegador com contexto persistente (cookies habilitados)
        context = p.firefox.launch_persistent_context(user_data_dir, headless=False, slow_mo=3000)
        page = context.new_page()

        print("Acessando a página de login...")
        page.goto("https://next.novavidati.com.br/login/index")

        # Se já estiver logado, não faz login de novo
        if "login" not in page.url.lower():
            print("Já está logado com cookies anteriores.")
            context.close()
            return

        print("Preenchendo dados...")
        page.fill('input[name="Email"]', usuario)
        page.fill('input[name="Senha"]', senha)

        # Verifica se há captcha
        try:
            captcha = page.locator('iframe[src*="recaptcha"]')
            if captcha.is_visible():
                print("Captcha detectado. Resolva manualmente.")
                input("Depois de resolver o captcha, pressione Enter para continuar...")
        except:
            print("Nenhum captcha visível.")

        page.click('button[type="submit"]')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(5000)

        # Verifica se o login foi bem-sucedido
        url_atual = page.url
        if "login" in url_atual.lower():
            print("Login falhou. Cookies ou validação de dispositivo impediram o acesso.")
        else:
            print("Login realizado com sucesso e cookies ativados.")

        # Não fecha o browser para manter a sessão viva se quiser
        context.close()

# Uso:
fazer_login("donne.santos@bettegacob.com.br", "Ennody0604!")
