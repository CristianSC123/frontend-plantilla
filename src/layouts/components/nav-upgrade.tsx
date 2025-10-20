import type { StackProps } from '@mui/material/Stack';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export function NavUpgrade({ sx, ...other }: StackProps) {
  return (
    <Box
      sx={[
        {
          mb: 4,
          display: 'flex',
          textAlign: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >

          <Typography>Essiet 2025</Typography>

    </Box>
  );
}
