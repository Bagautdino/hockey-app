"""Add assessment fields to videos"""
from alembic import op
import sqlalchemy as sa

revision = "007"
down_revision = "006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("videos", sa.Column("rating", sa.Integer(), nullable=True))
    op.add_column("videos", sa.Column("assessment_date", sa.Date(), nullable=True))
    op.add_column("videos", sa.Column("comment", sa.Text(), nullable=True))
    op.add_column("videos", sa.Column("training_plan", sa.Text(), nullable=True))
    op.add_column("videos", sa.Column("is_assessment", sa.Boolean(), server_default="false", nullable=False))


def downgrade() -> None:
    op.drop_column("videos", "is_assessment")
    op.drop_column("videos", "training_plan")
    op.drop_column("videos", "comment")
    op.drop_column("videos", "assessment_date")
    op.drop_column("videos", "rating")
