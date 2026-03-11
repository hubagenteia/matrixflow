# Configuração de Níveis e Curva de XP

Este documento centraliza a lógica do sistema de progressão do MatrixFlow. O XP não é mais configurado manualmente para cada nível; ele é calculado de forma dinâmica através de uma fórmula matemática exponencial.

## A Fórmula

O XP necessário para alcançar qualquer nível (sendo o primeiro nível o índice `0`) é definido pela seguinte fórmula em JavaScript:

```javascript
Math.floor(XP_BASE * Math.pow(levelIndex, XP_EXPONENT))
```

### Constantes Atuais
* **Base (`XP_BASE`):** `7.65`
* **Expoente (`XP_EXPONENT`):** `3`
* Level Max Original (50 níveis, índice 49): Requer `~900.024 XP`

Através dessa fórmula `7.65 * (nível ^ 3)`, você terá uma curva de progressão suave no início e que exige progressivamente mais foco (mais pomodoros) ao atingir patamares maiores (Level 20+).

## Como Ajustar a Progressão

Tudo é regulado via código no **topo** do arquivo `script.js`.

### 1. Adicionar ou Remover Níveis
Basta mexer no array `LEVELS`. 
- Se você adicionar 10 novos nomes ao final do array, o sistema passará automaticamente a ter 60 níveis. O último nível continuará seguindo a matemática (Ex: índice 59 -> `7.65 * 59^3 = 1.571.185 XP`).
- Isso não quebra o save ou os níveis antigos, tudo se reajusta perfeitamente.

### 2. Modificar a Velocidade de Subida
Altere as variáveis no topo do `script.js`:
- **`XP_BASE`**: Multiplicador direto. Aumentar esse valor (ex: de `7.65` para `10.0`) fará _todos_ os níveis precisarem de mais XP de forma linear. Diminuir faz você upar mais rápido.
- **`XP_EXPONENT`**: Este dita o formato da curva. Um expoente `2` seria uma curva suave. Um `3` requer muito esforço nos leveis altos. Um `4` faria com que fosse quase impossível chegar aos níveis máximos sem anos de uso. Mexa nisso com cuidado!

## Lista de Níveis (Para Referência)
Os níveis atuais no sistema são:

0. Motorista 5 Estrelas
1. Iniciado na Matrix
2. Estudante de Lógica
3. Iniciado em JSON
4. Engenheiro de Prompt
5. Mestre do Prompt
6. Curioso do n8n
7. Observador de Código
8. Explorador de Nós
9. Invocador de Webhooks
10. Anomalia no Código
11. Infiltrado no Sistema
12. Hacker de Scripts
13. Manipulador de Variáveis
14. Domador de Bots
15. Desenvolvedor de Agentes
16. Scripter de Elite
17. Especialista em Contexto
18. Mestre dos Workflows
19. Alquimista de Dados
20. Mestre das APIs
21. Integrador de Sistemas
22. Otimizador Cibernético
23. Estrategista de Automação
24. Criador de Frameworks
25. Arquiteto de Fluxos
26. Tech Lead de IA
27. Engenheiro de Machine Learning
28. Especialista em Deep Learning
29. Visionário de Dados
30. Domador de LLMs
31. Hacker de Redes Neurais
32. Orquestrador de Agentes
33. Orquestrador de Enxames
34. Arquiteto de Soluções Cloud
35. Engenheiro de Singularidade
36. Diretor de Engenharia IA
37. Tech Lead da Singularidade
38. Cientista de Agentes
39. Pesquisador de IAG
40. Unicórnio do Deep Tech
41. Founder Tech do Vale
42. Arquiteto de IAs Autônomas
43. Arquiteto da Superinteligência
44. Pioneiro do Código Consciente
45. Entidade Digital
46. Ghost in the Shell
47. Deus Ex Machina
48. Oráculo da Matrix
49. Lenda do Vale do Silício
