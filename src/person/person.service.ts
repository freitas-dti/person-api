import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './person.entity';
import { PersonRequest } from './person.interface';

@Injectable()
export class PersonService {
constructor(
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
) {}

async savePerson(data: any): Promise<Person> {
    const person = this.personRepository.create({
        name: data.name,
        lastName: data.lastName,
        age: data.age,
        weight: data.weight,
        localId: data.localId,
        createdAt: new Date(data.createdAt),  // Data de criação no servidor
        syncedAt: new Date()    // Data de sincronização
    });

    console.log('Saving person with dates:', {
        createdAt: person.createdAt,
        syncedAt: person.syncedAt
    });

    return await this.personRepository.save(person);
}

async syncPeople(people: any[]): Promise<string[]> {
    const syncedIds: string[] = [];

    try {
        for (const personData of people) {
            console.log('Processing person:', personData);
            
            const person = this.personRepository.create({
                name: personData.name,
                lastName: personData.lastName,
                age: personData.age,
                weight: personData.weight,
                localId: personData.localId,
                createdAt: new Date(personData.createdAt), // Usa a data de criação original
                syncedAt: new Date() // Nova data de sincronização
            });

            const savedPerson = await this.personRepository.save(person);
            syncedIds.push(personData.localId);
            
            console.log(`Saved person with dates:`, {
                localId: personData.localId,
                createdAt: person.createdAt,
                syncedAt: person.syncedAt
            });
        }

        return syncedIds;
    } catch (error) {
        console.error('Error syncing people:', error);
        throw error;
    }
}
}