use anchor_lang::prelude::*;

declare_id!("81yXP67oLaVK2bo3KGwk6zNFZiuCn5uss1DWaM8vshm6");

#[program]
pub mod descholar {
    use super::*;

    pub fn initialize_author(ctx: Context<InitializeAuthor>, name: String) -> Result<()> {
        let author_profile = &mut ctx.accounts.author_profile;
        author_profile.author = ctx.accounts.authority.key();
        author_profile.name = name;
        author_profile.paper_count = 0;
        Ok(())
    }

    pub fn publish_paper(
        ctx: Context<PublishPaper>,
        title: String,
        ipfs_hash: String,
        metadata: String 
    ) -> Result<()> {
        let paper = &mut ctx.accounts.paper;
        let author_profile = &mut ctx.accounts.author_profile;
        let clock = Clock::get()?;

        paper.author = ctx.accounts.authority.key();
        paper.title = title;
        paper.ipfs_hash = ipfs_hash;
        paper.metadata = metadata;
        paper.timestamp = clock.unix_timestamp;
        paper.bump = ctx.bumps.paper;

        author_profile.paper_count += 1;
        Ok(())
    }

    pub fn add_comment(ctx: Context<AddComment>, content: String, comment_id: u64) -> Result<()> {
        let comment = &mut ctx.accounts.comment;
        let clock = Clock::get()?;

        comment.author = ctx.accounts.authority.key();
        comment.paper = ctx.accounts.paper.key();
        comment.content = content;
        comment.timestamp = clock.unix_timestamp;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeAuthor<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 100 + 8, 
        seeds = [b"author", authority.key().as_ref()],
        bump
    )]
    pub author_profile: Account<'info, AuthorProfile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String, ipfs_hash: String)]
pub struct PublishPaper<'info> {
    #[account(
        init,
        payer = authority,
        // 扩容：8(disc) + 32(pubkey) + 100(title) + 100(ipfs) + 1024(metadata) + 8(time) + 1(bump)
        space = 8 + 32 + 100 + 100 + 1024 + 8 + 1, 
        seeds = [b"paper", authority.key().as_ref(), ipfs_hash.as_bytes()],
        bump
    )]
    pub paper: Account<'info, Paper>,
    #[account(mut, seeds = [b"author", authority.key().as_ref()], bump)]
    pub author_profile: Account<'info, AuthorProfile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(content: String, comment_id: u64)] // 引入 comment_id 解决种子依赖
pub struct AddComment<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 1024 + 8, // 评论也扩容到 1024
        seeds = [
            b"comment", 
            paper.key().as_ref(), 
            authority.key().as_ref(), 
            &comment_id.to_le_bytes() // 使用前端生成的随机数或计数器
        ],
        bump
    )]
    pub comment: Account<'info, Comment>,
    pub paper: Account<'info, Paper>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// ... (Account 结构体保持不变)
#[account]
pub struct AuthorProfile {
    pub author: Pubkey,
    pub name: String,
    pub paper_count: u64,
}

#[account]
pub struct Paper {
    pub author: Pubkey,
    pub title: String,
    pub ipfs_hash: String,
    pub metadata: String,
    pub timestamp: i64,
    pub bump: u8,
}

#[account]
pub struct Comment {
    pub author: Pubkey,
    pub paper: Pubkey,
    pub content: String,
    pub timestamp: i64,
}