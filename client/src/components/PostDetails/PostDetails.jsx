import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  CircularProgress,
  Divider,
} from '@material-ui/core/';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { useParams, useHistory, Link } from 'react-router-dom';
import Rating from '@material-ui/lab/Rating';

import { getPost, getPostsBySearch, ratingPost } from '../../actions/posts';
import CommentSection from './CommentSection';
import useStyles from './styles';

const Post = () => {
  const user = JSON.parse(localStorage.getItem('profile'));
  const { post, posts, isLoading } = useSelector((state) => state.posts);
  const dispatch = useDispatch();
  const history = useHistory();
  const classes = useStyles();
  const { id } = useParams();
  const [ratingValue, setRatingValue] = useState(0);

  useEffect(() => {
    dispatch(getPost(id));
  }, [id]);

  useEffect(() => {
    if (post) {
      dispatch(
        getPostsBySearch({ search: 'none', tags: post?.tags.join(',') })
      );
    }
  }, [post]);

  if (!post) return null;

  const openPost = (_id) => history.push(`/posts/${_id}`);

  if (isLoading) {
    return (
      <Paper elevation={6} className={classes.loadingPaper}>
        <CircularProgress size='7em' />
      </Paper>
    );
  }

  const recommendedPosts = posts.filter(({ _id }) => _id !== post._id);
  const ratings = post.ratings;
  const specificRating = ratings?.filter(
    (rating) => rating.split(':')[0] === user?.result?.username
  );
  const specificRatingValue = specificRating.length > 0? Number(specificRating[0].split(":")[1]):0;

  return (
    <Paper style={{ padding: '20px', borderRadius: '15px' }} elevation={6}>
      <div className={classes.card}>
        <div className={classes.section}>
          <Typography variant='h3' component='h2'>
            {post.title}
          </Typography>
          <Typography
            gutterBottom
            variant='h6'
            color='textSecondary'
            component='h2'
          >
            {post.tags.map((tag) => (
              <Link
                to={`/tags/${tag}`}
                style={{ textDecoration: 'none', color: '#3f51b5' }}
              >
                {` #${tag} `}
              </Link>
            ))}
          </Typography>
          <Typography gutterBottom variant='body1' component='p'>
            {post.message}
          </Typography>
          <Typography variant='h6'>
            Created by:
            <Link
              to={`/creators/${post.name}`}
              style={{ textDecoration: 'none', color: '#3f51b5' }}
            >
              {` ${post.name}`}
            </Link>
          </Typography>
          <Typography variant='body1'>
            {moment(post.createdAt).fromNow()}
          </Typography>
          <Divider style={{ margin: '20px 0' }} />

          <Divider style={{ margin: '20px 0' }} />
          {user?.result?.username ? (
            <div>
              <Typography component='legend' variant='h6'>
                <strong>Rating: {specificRatingValue?specificRatingValue:0.0}</strong>
              </Typography>
              {specificRatingValue ? (
                <Rating
                  name='Rating Label'
                  value={specificRatingValue}
                  precision={0.5}
                  readOnly={true}
                />
              ) : (
                <Rating
                  name='Rating Label'
                  value={ratingValue}
                  precision={0.5}
                  onChange={async (event) => {
                    setRatingValue(Number(event.target.value));
                    await dispatch(
                      ratingPost(
                        `${user?.result?.username}: ${event.target.value}`,
                        post._id
                      )
                    );
                    window.location.reload(true);
                    
                  }}
                />
              )}
            </div>
          ) : (
            <Typography variant='body1'>
              <strong>Please login to rate post</strong>
            </Typography>
          )}
          <Divider style={{ margin: '20px 0' }} />
          <CommentSection post={post} />
          <Divider style={{ margin: '20px 0' }} />
        </div>
        <div className={classes.imageSection}>
          <img
            className={classes.media}
            src={
              post.selectedFile ||
              'https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png'
            }
            alt={post.title}
          />
        </div>
      </div>
      {!!recommendedPosts.length && (
        <div className={classes.section}>
          <Typography gutterBottom variant='h5'>
            You might also like:
          </Typography>
          <Divider />
          <div className={classes.recommendedPosts}>
            {recommendedPosts.map(
              ({ title, name, message, likes, selectedFile, _id }) => (
                <div
                  style={{ margin: '20px', cursor: 'pointer' }}
                  onClick={() => openPost(_id)}
                  key={_id}
                >
                  <Typography gutterBottom variant='h6'>
                    {title}
                  </Typography>
                  <Typography gutterBottom variant='subtitle2'>
                    {name}
                  </Typography>
                  <Typography gutterBottom variant='subtitle2'>
                    {message}
                  </Typography>
                  <Typography gutterBottom variant='subtitle1'>
                    Likes: {likes.length}
                  </Typography>
                  <img src={selectedFile} width='200px' />
                </div>
              )
            )}
          </div>
        </div>
      )}
    </Paper>
  );
};

export default Post;
