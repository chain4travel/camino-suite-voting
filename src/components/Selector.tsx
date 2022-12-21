import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  CardActionArea,
  CardActions,
  CardContent,
  Typography,
  Card,
} from '@mui/material';

interface SelectorProps {
  title: string;
  optionx: string;
  btnCtx: string;
  url: string;
}

const Selector: React.FC<SelectorProps> = (props: SelectorProps) => {
  const { title, ctx, btnCtx, url } = props;
  const navigate = useNavigate();
  const handleClick = () => navigate(url);
  return (
    <Card sx={{ maxWidth: 400, marginTop: '20px', marginLeft: '20px' }}>
      <CardActionArea>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {ctx}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="small" color="primary" onClick={handleClick}>
          Open {btnCtx} Voting
        </Button>
      </CardActions>
    </Card>
  );
};

export default Selector;
