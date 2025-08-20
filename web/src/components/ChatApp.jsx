import React, { useState, useRef, useEffect } from 'react';
import './ChatApp.css';

// ---------------- メイン ChatApp コンポーネント ----------------
export default function ChatApp({ wsUrl }) {
    const [nameInput, setNameInput] = useState('');
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [connecting, setConnecting] = useState(false);
    const [connectionError, setConnectionError] = useState(false);
    const [monkeyFrenzy, setMonkeyFrenzy] = useState(false);

    const ws = useRef(null);
    const messagesEndRef = useRef(null);

    // ---------------- チャット更新時にスクロール ----------------
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat]);

    // ---------------- MonkeyFrenzy演出 ----------------
    const triggerMonkeyFrenzy = () => {
        if (monkeyFrenzy) return;
        setMonkeyFrenzy(true);
        setTimeout(() => setMonkeyFrenzy(false), 5000); // 5秒間
    };

    // ---------------- WebSocket接続 ----------------
    const connectWebSocket = (name) => {
        setConnecting(true);
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            ws.current = socket;
            setUsername(name);
            setConnecting(false);
            setConnectionError(false);

            // 自分の入室メッセージをサーバーに送信
            ws.current.send(JSON.stringify({
                action: 'sendmessage',
                username: name,
                message: `${name} が入室しました`
            }));
        };

        socket.onerror = () => {
            setConnecting(false);
            setConnectionError(true);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            setChat(prev => [...prev, { ...data, effect: true }]);

            // エフェクトを0.5秒で消す
            setTimeout(() => {
                setChat(prev =>
                    prev.map((msg, idx) =>
                        idx === prev.length - 1 ? { ...msg, effect: false } : msg
                    )
                );
            }, 500);

            // MonkeyFrenzy判定
            if (/さる|猿|サル|saru|monkey|Monkey|MONKEY/.test(data.message)) {
                triggerMonkeyFrenzy();
            }
        };

        socket.onclose = () => {
            console.log('WebSocket closed');
        };
    };

    // ---------------- ログインボタン ----------------
    const handleLogin = () => {
        const trimmedName = nameInput.trim();
        if (trimmedName) connectWebSocket(trimmedName);
    };

    // ---------------- メッセージ送信 ----------------
    const handleSendMessage = () => {
        if (!message || !ws.current) return;

        ws.current.send(JSON.stringify({
            action: 'sendmessage',
            message,
            username,
        }));
        setMessage('');
    };

    // ---------------- ログイン画面 ----------------
    if (!username) {
        return (
            <div className="login-screen">
                <h1>もんきーちゃっと🐒💬</h1>
                <input
                    placeholder="お名前を入力"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    disabled={connecting}
                />
                {connecting ? <div className="spinner" /> :
                    <button onClick={handleLogin}>参加</button>}
                {connectionError && (
                    <p style={{ color: 'red', marginTop: '1rem' }}>
                        接続に失敗しました。ネットワークまたはサーバーを確認してください。
                    </p>
                )}
            </div>
        );
    }

    // ---------------- チャット画面 ----------------
    return (
        <div className="chat-container" style={{ position: 'relative', overflow: 'hidden' }}>
            <h1>もんきーちゃっと🐒💬</h1>

            {/* チャット履歴 */}
            <div className="messages">
                {chat.map((msg, i) => {
                    const isYou = msg.username === username;

                    // 入室メッセージをシステム風に表示
                    if (msg.message.endsWith('が入室しました')) {
                        return (
                            <div key={i} className="message system">
                                👤 {msg.message}
                            </div>
                        );
                    }

                    return (
                        <div
                            key={i}
                            className={`message ${isYou ? 'you' : 'other'} ${msg.effect ? 'effect' : ''}`}
                        >
                            <strong>{msg.username}:</strong> {msg.message}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* 入力エリア */}
            <div className="input-area">
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                    placeholder="キーキー..."
                />
                <button onClick={handleSendMessage}>送信</button>
            </div>

            {/* MonkeyFrenzy演出 */}
            {monkeyFrenzy && <MonkeyFrenzy />}
        </div>
    );
}

// ---------------- MonkeyFrenzy コンポーネント ----------------
function MonkeyFrenzy() {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const colors = ['#ff6b6b', '#feca57', '#54a0ff', '#1dd1a1', '#ee5253', '#f368e0'];
        const texts = ['🐒', 'キーキー', '🙈', '🐵', 'MONKEY', 'さる', 'サル', '猿'];

        const newParticles = Array.from({ length: 500 }).map(() => {
            const size = Math.random() * 40 + 15;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const text = texts[Math.floor(Math.random() * texts.length)];

            const edge = Math.floor(Math.random() * 4);
            let style = {};
            let animationName = '';
            switch (edge) {
                case 0: style = { top: '-50px', left: `${Math.random() * 100}%` }; animationName = 'moveDownFrenzy'; break;
                case 1: style = { top: `${Math.random() * 100}%`, right: '-50px' }; animationName = 'moveLeftFrenzy'; break;
                case 2: style = { bottom: '-50px', left: `${Math.random() * 100}%` }; animationName = 'moveUpFrenzy'; break;
                case 3: style = { top: `${Math.random() * 100}%`, left: '-50px' }; animationName = 'moveRightFrenzy'; break;
            }

            return {
                id: Math.random().toString(36).substr(2, 9),
                text,
                color,
                size,
                style,
                animationName,
                duration: (Math.random() * 5 + 2).toFixed(2),
                rotate: (Math.random() * 720 - 360).toFixed(1),
                delay: (Math.random() * 1).toFixed(2),
            };
        });

        setParticles(newParticles);
    }, []);

    return (
        <div className="monkey-frenzy-container" aria-hidden="true">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="monkey-particle"
                    style={{
                        ...p.style,
                        color: p.color,
                        fontSize: p.size,
                        animationName: p.animationName,
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`,
                        transform: `rotate(${p.rotate}deg)`,
                    }}
                >
                    {p.text}
                </div>
            ))}
        </div>
    );
}
