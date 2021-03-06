import { getRepository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    // TODO
    const categoryRepository = getRepository(Category);
    const CheckCategoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!CheckCategoryExists) {
      const categoryCreated = categoryRepository.create({ title: category });
      await categoryRepository.save(categoryCreated);
    }
    const categoryFounded = await categoryRepository.findOneOrFail({
      where: { title: category },
    });

    const transactionRepository = getCustomRepository(TransactionRepository);

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && balance.total - value < 0) {
      throw new AppError('not enough balance to do that.');
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryFounded.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
