import React, { useState, useRef, useEffect } from 'react';
import './ChatApp.css';

// ---------------- メインChatAppコンポーネント ----------------
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

    // チャットが更新されたらスクロール
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat]);

    // 3秒間だけモンキーフレンジ状態にして自動解除
    const triggerMonkeyFrenzy = () => {
        if (monkeyFrenzy) return; // 連続発動防止
        setMonkeyFrenzy(true);
        setTimeout(() => setMonkeyFrenzy(false), 3000);
    };

    const connectWebSocket = (name) => {
        setConnecting(true);
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            ws.current = socket;
            setUsername(name);
            setConnecting(false);
            setConnectionError(false);
        };

        socket.onerror = () => {
            setConnecting(false);
            setConnectionError(true);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setChat((prev) => [...prev, { ...data, effect: true }]);
            setTimeout(() => {
                setChat((prev) =>
                    prev.map((msg, idx) =>
                        idx === prev.length - 1 ? { ...msg, effect: false } : msg
                    )
                );
            }, 500);

            // キーワードが含まれていたら演出開始
            if (
                /さる|猿|サル|saru|monkey|Monkey|MONKEY/.test(data.message)
            ) {
                triggerMonkeyFrenzy();
            }
        };

        socket.onclose = () => {
            console.log('WebSocket closed');
        };
    };

    const handleLogin = () => {
        const trimmedName = nameInput.trim();
        if (trimmedName) {
            connectWebSocket(trimmedName);
        }
    };

    const handleSendMessage = () => {
        if (!message || !ws.current) return;

        const newMsg = {
            action: 'sendmessage',
            message,
            username,
        };

        ws.current.send(JSON.stringify(newMsg));
        setMessage('');
    };

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
                {connecting ? (
                    <div className="spinner" />
                ) : (
                    <button onClick={handleLogin}>参加</button>
                )}
                {connectionError && (
                    <p style={{ color: 'red', marginTop: '1rem' }}>
                        接続に失敗しました。ネットワークまたはサーバーを確認してください。
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="chat-container" style={{ position: 'relative', overflow: 'hidden' }}>
            <h1>もんきーちゃっと🐒💬</h1>
            <div className="messages">
                {chat.map((msg, i) => {
                    const isYou = msg.username === username;
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
            <div className="input-area">
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                    }}
                    placeholder="キーキー..."
                />
                <button onClick={handleSendMessage}>送信</button>
            </div>

            {/* monkey frenzy がONの時だけ演出表示 */}
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

        // 150個に増やす
        const newParticles = Array.from({ length: 500 }).map(() => {
            const size = Math.random() * 40 + 15; // 15〜55pxでよりバラつき大きく
            const color = colors[Math.floor(Math.random() * colors.length)];
            const text = texts[Math.floor(Math.random() * texts.length)];

            // ランダムに上下左右どこから出るか決定
            const edge = Math.floor(Math.random() * 4);

            let style = {};
            let animationName = '';
            switch (edge) {
                case 0:
                    style = { top: '-50px', left: `${Math.random() * 100}%` };
                    animationName = 'moveDownFrenzy';
                    break;
                case 1:
                    style = { top: `${Math.random() * 100}%`, right: '-50px' };
                    animationName = 'moveLeftFrenzy';
                    break;
                case 2:
                    style = { bottom: '-50px', left: `${Math.random() * 100}%` };
                    animationName = 'moveUpFrenzy';
                    break;
                case 3:
                    style = { top: `${Math.random() * 100}%`, left: '-50px' };
                    animationName = 'moveRightFrenzy';
                    break;
            }

            return {
                id: Math.random().toString(36).substr(2, 9),
                text,
                color,
                size,
                style,
                animationName,
                duration: (Math.random() * 5 + 2).toFixed(2), // 2〜5秒で動く（幅広げた）
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