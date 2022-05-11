"""empty message

Revision ID: b48811b00f44
Revises: 0cd957191a64
Create Date: 2022-05-11 12:32:10.565582

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b48811b00f44'
down_revision = '0cd957191a64'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('statistics',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('score', sa.Integer(), nullable=True),
    sa.Column('timeTaken', sa.String(length=140), nullable=True),
    sa.ForeignKeyConstraint(['id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_statistics_score'), 'statistics', ['score'], unique=False)
    op.create_index(op.f('ix_statistics_timeTaken'), 'statistics', ['timeTaken'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_statistics_timeTaken'), table_name='statistics')
    op.drop_index(op.f('ix_statistics_score'), table_name='statistics')
    op.drop_table('statistics')
    # ### end Alembic commands ###
