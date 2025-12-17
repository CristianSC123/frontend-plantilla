import { useState, useRef, useEffect } from 'react';
import {
    Box,
    Paper,
    TextField,
    IconButton,
    Typography,
    Avatar,
    Stack,
    Chip,
    CircularProgress,
    Fade,
    Divider
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import axios from 'axios';

interface Message {
    id: string;
    texto: string;
    esUsuario: boolean;
    timestamp: Date;
    loading?: boolean;
}

export default function ChatbotInterface() {
    const [mensajes, setMensajes] = useState<Message[]>([
        {
            id: '1',
            texto: '¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
            esUsuario: false,
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [mensajes]);

    const enviarMensaje = async () => {
        if (!inputValue.trim() || loading) return;

        const mensajeUsuario: Message = {
            id: Date.now().toString(),
            texto: inputValue,
            esUsuario: true,
            timestamp: new Date()
        };

        setMensajes(prev => [...prev, mensajeUsuario]);
        setInputValue('');
        setLoading(true);

        // Mensaje de "escribiendo..."
        const loadingMessage: Message = {
            id: 'loading',
            texto: '',
            esUsuario: false,
            timestamp: new Date(),
            loading: true
        };
        setMensajes(prev => [...prev, loadingMessage]);

        try {
            const response = await axios.post('http://localhost:3000/chatbot/consulta', {
                mensaje: inputValue
            });

            // Remover mensaje de loading
            setMensajes(prev => prev.filter(msg => msg.id !== 'loading'));

            const mensajeBot: Message = {
                id: (Date.now() + 1).toString(),
                texto: response.data.respuesta || response.data.message || 'Lo siento, no pude procesar tu solicitud.',
                esUsuario: false,
                timestamp: new Date()
            };

            setMensajes(prev => [...prev, mensajeBot]);
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            
            // Remover mensaje de loading
            setMensajes(prev => prev.filter(msg => msg.id !== 'loading'));

            const mensajeError: Message = {
                id: (Date.now() + 1).toString(),
                texto: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta nuevamente.',
                esUsuario: false,
                timestamp: new Date()
            };

            setMensajes(prev => [...prev, mensajeError]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensaje();
        }
    };

    const sugerencias = [
        '¿Tiene pantalla para el A72?',
        '¿Buenos días, tienen pantalla para el Huawei P30 pro?'
    ];

    const usarSugerencia = (sugerencia: string) => {
        setInputValue(sugerencia);
        inputRef.current?.focus();
    };

    return (
        <Paper
            elevation={3}
            sx={{
                height: 'calc(100vh - 200px)',
                maxHeight: '700px',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden'
            }}
        >
            {/* Header del Chat */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}
            >
                <Avatar
                    sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        width: 50,
                        height: 50,
                        border: '3px solid rgba(255,255,255,0.3)'
                    }}
                >
                    <Iconify icon="solar:chat-round-dots-bold" width={28} />
                </Avatar>
                <Box flex={1}>
                    <Typography variant="h6" fontWeight="bold">
                        Asistente Virtual
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: '#4ade80',
                                animation: 'pulse 2s infinite'
                            }}
                        />
                        <Typography variant="caption">En línea</Typography>
                    </Box>
                </Box>
                <IconButton sx={{ color: 'white' }}>
                    <Iconify icon="solar:menu-dots-bold" />
                </IconButton>
            </Box>

            {/* Área de mensajes */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: 3,
                    bgcolor: '#f8f9fa',
                    backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#cbd5e1',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: '#94a3b8',
                    },
                }}
            >
                <Stack spacing={2}>
                    {mensajes.map((mensaje, index) => (
                        <Fade in key={mensaje.id} timeout={300}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: mensaje.esUsuario ? 'flex-end' : 'flex-start',
                                    alignItems: 'flex-start',
                                    gap: 1.5
                                }}
                            >
                                {!mensaje.esUsuario && (
                                    <Avatar
                                        sx={{
                                            bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            width: 36,
                                            height: 36
                                        }}
                                    >
                                        <Iconify icon="solar:smart-speaker-bold" width={20} />
                                    </Avatar>
                                )}

                                <Box
                                    sx={{
                                        maxWidth: '70%',
                                        minWidth: mensaje.loading ? '100px' : 'auto'
                                    }}
                                >
                                    <Paper
                                        elevation={mensaje.esUsuario ? 2 : 1}
                                        sx={{
                                            p: 1.5,
                                            px: 2,
                                            borderRadius: mensaje.esUsuario ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                            background: mensaje.esUsuario
                                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                : 'white',
                                            color: mensaje.esUsuario ? 'white' : 'text.primary',
                                            boxShadow: mensaje.esUsuario
                                                ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                                                : '0 2px 8px rgba(0,0,0,0.08)'
                                        }}
                                    >
                                        {mensaje.loading ? (
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <CircularProgress size={16} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Escribiendo...
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-word'
                                                }}
                                            >
                                                {mensaje.texto}
                                            </Typography>
                                        )}
                                    </Paper>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            display: 'block',
                                            mt: 0.5,
                                            px: 1,
                                            textAlign: mensaje.esUsuario ? 'right' : 'left'
                                        }}
                                    >
                                        {mensaje.timestamp.toLocaleTimeString('es-BO', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Typography>
                                </Box>

                                {mensaje.esUsuario && (
                                    <Avatar
                                        sx={{
                                            bgcolor: 'primary.main',
                                            width: 36,
                                            height: 36
                                        }}
                                    >
                                        <Iconify icon="solar:user-bold" width={20} />
                                    </Avatar>
                                )}
                            </Box>
                        </Fade>
                    ))}
                    <div ref={messagesEndRef} />
                </Stack>
            </Box>

            {/* Sugerencias rápidas */}
            {mensajes.length <= 1 && (
                <Box sx={{ px: 3, pb: 2, bgcolor: '#f8f9fa' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Prueba con estas preguntas:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {sugerencias.map((sugerencia, index) => (
                            <Chip
                                key={index}
                                label={sugerencia}
                                onClick={() => usarSugerencia(sugerencia)}
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: 'primary.main',
                                        color: 'white'
                                    }
                                }}
                                icon={<Iconify icon="solar:lightbulb-bolt-bold" />}
                            />
                        ))}
                    </Stack>
                </Box>
            )}

            <Divider />

            {/* Input de mensaje */}
            <Box sx={{ p: 2, bgcolor: 'white' }}>
                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'flex-end'
                    }}
                >
                    <TextField
                        inputRef={inputRef}
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder="Escribe tu mensaje aquí..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '24px',
                                bgcolor: '#f8f9fa',
                                '& fieldset': {
                                    borderColor: 'transparent'
                                },
                                '&:hover fieldset': {
                                    borderColor: 'primary.main'
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'primary.main'
                                }
                            }
                        }}
                    />
                    <IconButton
                        color="primary"
                        onClick={enviarMensaje}
                        disabled={!inputValue.trim() || loading}
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            width: 48,
                            height: 48,
                            '&:hover': {
                                bgcolor: 'primary.dark'
                            },
                            '&.Mui-disabled': {
                                bgcolor: 'action.disabledBackground'
                            }
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            <Iconify icon="solar:plain-3-bold" width={24} />
                        )}
                    </IconButton>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', px: 2 }}>
                    Presiona Enter para enviar, Shift + Enter para nueva línea
                </Typography>
            </Box>

            {/* Animación CSS para el pulso */}
            <style>
                {`
                    @keyframes pulse {
                        0%, 100% {
                            opacity: 1;
                        }
                        50% {
                            opacity: 0.5;
                        }
                    }
                `}
            </style>
        </Paper>
    );
}