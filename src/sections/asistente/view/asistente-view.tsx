import { Box, Container, Typography } from '@mui/material';
import ChatbotInterface from '../index';

export default function AsistenteView() {
    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                        Asistente Virtual
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Pregúntame sobre la dispnibilidad de productos.
                    </Typography>
                </Box>

                <ChatbotInterface />
            </Box>
        </Container>
    );
}