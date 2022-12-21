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

interface ProposalCardProps {
  title: string;
  ctx: string;
  btnCtx: string;
  url: string;
}

const ProposalCard: React.FC<ProposalCardProps> = (
  props: ProposalCardProps
) => {
  const { title, ctx, btnCtx, url } = props;
  const navigate = useNavigate();
  return (
    <Card
      sx={{ maxWidth: 400, height: 270, marginTop: '60px', marginLeft: '60px' }}
    >
      <CardActionArea>
        123
        <CardContent>
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            sx={{ height: 60 }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ height: 120 }}
          >
            {ctx}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button
          data-testid="skip-page"
          size="small"
          color="primary"
          onClick={() => navigate(url)}
        >
          Open {btnCtx} Voting
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProposalCard;
