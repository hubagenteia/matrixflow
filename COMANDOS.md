# 🛠️ Comandos de Sincronização Manual (XP/Nível)

Como o progresso é salvo localmente no seu navegador, use estes comandos no **Console do Navegador** (F12) caso mude de máquina ou queira ajustar seu progresso.

## 📝 Como usar

1. Abra o site no Vercel (ou local).
2. Aperte `F12` e clique na aba **Console**.
3. Cole o comando e dê `Enter`.

---

## 🚀 Sincronizar XP e Nível

Este comando define seu XP total. O sistema calculará o nível automaticamente após o recarregamento.


```javascript
// Substitua o '5000' pelo valor de XP desejado
localStorage.setItem('uberToDevSave', JSON.stringify({
    xp: 5000, 
    level: 0, 
    missions: [], 
    streak: 0
})); 
location.reload();
```

---

## 🧹 Resetar Tudo

CUIDADO: Isso apaga todo o seu progresso local.


```javascript
localStorage.removeItem('uberToDevSave');
location.reload();
```
