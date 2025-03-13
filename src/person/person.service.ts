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

async savePerson(data: PersonRequest): Promise<Person> {
    const person = this.personRepository.create({
        name: data.name,
        lastName: data.lastName,
        age: data.age,
        weight: data.weight,
        localId: data.localId  // Certifique-se que está salvando o localId
    });

    return await this.personRepository.save(person);
}

async syncPeople(people: PersonRequest[]): Promise<string[]> {
    const syncedIds: string[] = [];

    try {
        for (const personData of people) {
            console.log('Processing person:', personData);
            
            const person = this.personRepository.create({
                name: personData.name,
                lastName: personData.lastName,
                age: personData.age,
                weight: personData.weight,
                localId: personData.localId  // Salvando o LocalId
            });

            const savedPerson = await this.personRepository.save(person);
            syncedIds.push(personData.localId);
            
            console.log(`Saved person with local ID ${personData.localId}, server ID: ${savedPerson.id}`);
        }

        return syncedIds;
    } catch (error) {
        console.error('Error syncing people:', error);
        throw error;
    }
}
}