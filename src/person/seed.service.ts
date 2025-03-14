import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './person.entity';

//# Para criar 10000 registros
// curl -X POST "http://localhost:3000/seed?count=10000"
@Injectable()
export class SeedService {
constructor(
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
) {}

async seedDatabase(count: number = 10000): Promise<{ success: boolean, count: number }> {
    try {
        const batchSize = 1000;
        const totalBatches = Math.ceil(count / batchSize);
        let totalInserted = 0;

        for (let batch = 0; batch < totalBatches; batch++) {
            const people: Partial<Person>[] = []; // Definindo o tipo do array
            const currentBatchSize = Math.min(batchSize, count - (batch * batchSize));

            for (let i = 0; i < currentBatchSize; i++) {
                const person = this.createRandomPerson(totalInserted + i);
                people.push(person);
            }

            await this.personRepository.createQueryBuilder()
                .insert()
                .into(Person)
                .values(people)
                .execute();

            totalInserted += currentBatchSize;
            console.log(`Inserted batch ${batch + 1}/${totalBatches} (${totalInserted}/${count} records)`);
        }

        return { success: true, count: totalInserted };
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
}

private createRandomPerson(index: number): Partial<Person> {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emma', 'William', 'Olivia'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));

    return {
        name: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
        age: Math.floor(Math.random() * 50) + 18,
        weight: Math.round((Math.random() * 50 + 50) * 10) / 10,
        createdAt: randomDate,
        syncedAt: new Date(),
        isSynced: true
    };
}
}